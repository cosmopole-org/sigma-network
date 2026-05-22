----------------------------- MODULE SigmaProtocol -----------------------------
EXTENDS Naturals, Sequences, FiniteSets, TLC

\* 
\* Sigma Federated Gaming Protocol – Core Model
\* This specification models the distributed game state machine with
\* an admin bot, multiple home servers, players, and crash fault tolerance.
\* For a full explanation see the paper "Sigma: WebAssembly-Powered Federated
\* Gaming with Decentralized Moderation and Twin-VM Execution".
\*

CONSTANTS
    Players,          \* Set of all players (human or bot)
    HomeServers,      \* Set of all home servers
    Topics,           \* Set of all game topics (each has a unique admin bot)
    MaxSeq            \* Upper bound on sequence numbers (for model checking)

\* Assume finite non-empty sets
ASSUME Players /= {} /\ HomeServers /= {} /\ Topics /= {}

\* Mapping from player to its home server
PlayerServer \in [Players -> HomeServers]

\* For each topic: which home server hosts its admin bot?
AdminServer \in [Topics -> HomeServers]

\* For each topic: the deterministic game logic function (mapping state+action -> new state)
\* For modeling, we represent state as a natural number and action as a natural number.
\* The game logic is simply addition (just for illustration; concrete games would differ).
GameLogic(state, action) == state + action

\* Global state variables
VARIABLES
    actionQueue,   \* per topic: sequence of actions that have been received but not yet processed
    state,         \* per topic: sequence number -> state value (array indexed by seq)
    seqNum,        \* per topic: the highest sequence number committed so far
    log,           \* per home server: for crash-tolerant replication (Raft-style log)
    role,          \* per home server: "leader" or "follower" for each topic
    lastCommitted  \* per home server: last known committed sequence number

\* Type invariant
TypeOK ==
    /\ actionQueue \in [Topics -> Seq(Players \X Topics \X Nat)]
    /\ state \in [Topics -> [Nat -> Nat]]
    /\ seqNum \in [Topics -> Nat]
    /\ log \in [HomeServers -> [Topics -> Seq([seq: Nat, state: Nat, action: Nat])]]
    /\ role \in [HomeServers -> [Topics -> {"leader", "follower"}]]
    /\ lastCommitted \in [HomeServers -> [Topics -> Nat]]

\* Initial state: no actions, initial state=0, seq=0, empty logs, no leaders yet
Init ==
    /\ actionQueue = [t \in Topics |-> << >>]
    /\ state = [t \in Topics |-> [0 |-> 0]]
    /\ seqNum = [t \in Topics |-> 0]
    /\ log = [h \in HomeServers |-> [t \in Topics |-> << >>]]
    /\ role = [h \in HomeServers |-> [t \in Topics |-> "follower"]]
    /\ lastCommitted = [h \in HomeServers |-> [t \in Topics |-> 0]]

\* Helper: the home server of a player
PlayerHS(p) == PlayerServer[p]

\* Admin bot’s home server for a topic
AdminHS(t) == AdminServer[t]

\* Generate a new state by applying an action to the latest known state of a topic
NextState(t, a) == LET latestSeq == seqNum[t]
                       latestState == state[t][latestSeq]
                   IN GameLogic(latestState, a)

\* A player sends an action to its home server (client -> home server)
SendAction(p, t, a) ==
    /\ p \in Players
    /\ a \in Nat
    /\ t \in Topics
    /\ PlayerHS(p) \in HomeServers
    /\ actionQueue' = [actionQueue EXCEPT ![t] = Append(@, <<p, t, a>>)]
    /\ UNCHANGED <<state, seqNum, log, role, lastCommitted>>

\* Home server forwards action to admin’s home server (if not already there)
ForwardAction(p, t, a) ==
    /\ LET senderHS == PlayerHS(p)
           adminHS == AdminHS(t)
       IN senderHS /= adminHS
    /\ \E msg \in Messages: \* abstract: we model as direct sending
       /\ actionQueue[t] /= << >>
       /\ Head(actionQueue[t]) = <<p, t, a>>
       /\ actionQueue' = [actionQueue EXCEPT ![t] = Tail(@)]
    /\ UNCHANGED <<state, seqNum, log, role, lastCommitted>>

\* Admin bot (leader) processes the next action in its queue
ProcessAction(t) ==
    /\ LET adminHS == AdminHS(t)
       IN role[adminHS][t] = "leader"
    /\ actionQueue[t] /= << >>
    /\ LET <<p, t, a>> == Head(actionQueue[t])
           newState == NextState(t, a)
           newSeq == seqNum[t] + 1
       IN
       /\ state' = [state EXCEPT ![t][newSeq] = newState]
       /\ seqNum' = [seqNum EXCEPT ![t] = newSeq]
       /\ actionQueue' = [actionQueue EXCEPT ![t] = Tail(@)]
       /\ \* broadcast Update to all participants' home servers (abstract)
       /\ \* For crash tolerance: append to leader's log, then replicate
       /\ LET logEntry == [seq |-> newSeq, state |-> newState, action |-> a]
          IN log' = [log EXCEPT ![adminHS][t] = Append(@, logEntry)]
    /\ UNCHANGED <<role, lastCommitted>>

\* Follower receives AppendEntries from leader (consensus step)
AppendEntries(h, t, entries) ==
    /\ h \in HomeServers
    /\ role[h][t] = "follower"
    /\ LET leaderHS == AdminHS(t)
       IN role[leaderHS][t] = "leader"
    /\ log' = [log EXCEPT ![h][t] = entries]
    /\ \* commit if matched majority (simplified: after replication)
    /\ lastCommitted' = [lastCommitted EXCEPT ![h][t] = Len(entries)]
    /\ UNCHANGED <<actionQueue, state, seqNum, role>>

\* Leader commits after majority acknowledges
LeaderCommit(t) ==
    /\ LET leaderHS == AdminHS(t)
       IN role[leaderHS][t] = "leader"
    /\ \* majority of replicas have lastCommitted >= some index
    /\ \* simplified: commit when at least one follower has caught up
    /\ \E h \in HomeServers \ {leaderHS}:
         lastCommitted[h][t] = seqNum[t]
    /\ \* apply the committed state to all followers (already done in AppendEntries)
    /\ UNCHANGED <<actionQueue, state, seqNum, log, role, lastCommitted>>

\* Crash failure: a home server stops (non-deterministically)
Crash(h) ==
    /\ h \in HomeServers
    /\ \* remove its role (becomes crashed state – we abstract by not taking any action)
    /\ role' = [role EXCEPT ![h] = [t \in Topics |-> "crashed"]]
    /\ UNCHANGED <<actionQueue, state, seqNum, log, lastCommitted>>

\* Recovery of a crashed home server (from persistent log)
Recover(h) ==
    /\ h \in HomeServers
    /\ role[h][CHOOSE t \in Topics: TRUE] = "crashed"
    /\ \* recover by contacting a current leader
    /\ \E leaderHS \in HomeServers:
         role[leaderHS][CHOOSE t \in Topics: TRUE] = "leader"
    /\ role' = [role EXCEPT ![h] = [t \in Topics |-> "follower"]]
    /\ \* restore lastCommitted from log (simplified)
    /\ lastCommitted' = [lastCommitted EXCEPT ![h] = [t \in Topics |-> Len(log[h][t])]]
    /\ UNCHANGED <<actionQueue, state, seqNum, log>>

\* Next-state relation: all possible transitions
Next ==
    \/ \E p \in Players, t \in Topics, a \in 0..5: SendAction(p, t, a)
    \/ \E p \in Players, t \in Topics, a \in 0..5: ForwardAction(p, t, a)
    \/ \E t \in Topics: ProcessAction(t)
    \/ \E h \in HomeServers, t \in Topics: AppendEntries(h, t, << >>)  \* concrete entries omitted for brevity
    \/ \E t \in Topics: LeaderCommit(t)
    \/ \E h \in HomeServers: Crash(h)
    \/ \E h \in HomeServers: Recover(h)

\* Fairness (weak fairness) ensures actions eventually processed
Fairness ==
    /\ \A t \in Topics: WF_Next(ProcessAction(t))
    /\ \A h \in HomeServers: WF_Next(Crash(h))
    /\ \A h \in HomeServers: WF_Next(Recover(h))

\* Safety: State consistency invariant
ConsistencyInvariant ==
    \A t \in Topics, h1, h2 \in HomeServers:
        (role[h1][t] /= "crashed" /\ role[h2][t] /= "crashed")
        => \A s \in 1..MaxSeq:
            (s <= Len(log[h1][t]) /\ s <= Len(log[h2][t]))
            => log[h1][t][s].state = log[h2][t][s].state

\* Liveness: Every sent action eventually leads to a state update
ActionEventuallyProcessed ==
    \A p \in Players, t \in Topics, a \in Nat:
        (SendAction(p,t,a) ~> \E s \in Nat: state[t][s] = NextState(t,a))

=============================================================================
\* The following constants can be set for model checking:
\*   Players <- {p1, p2}
\*   HomeServers <- {hs1, hs2}
\*   Topics <- {t1}
\*   MaxSeq <- 10
\* Symmetry and state constraints can be added to reduce state space.