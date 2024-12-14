
import { UserCollection, userSchema } from "../models/user";
import { createRxDatabase, addRxPlugin, RxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { SessionCollection, sessionSchema } from "../models/session";
import { SpaceCollection, spaceSchema } from "../models/space";
import { TopicCollection, topicSchema } from "../models/topic";
import { MemberCollection, memberSchema } from "../models/member";
import { InviteCollection, inviteSchema } from "../models/invite";
import { SecretCollection, secretSchema } from "../models/secret";
import { MessageCollection, messageSchema } from "../models/message";
import { InteractionCollection, interactionSchema } from "../models/interaction";

addRxPlugin(RxDBDevModePlugin);

export type DatabaseCollections = {
    users: UserCollection
    sessions: SessionCollection
    spaces: SpaceCollection
    topics: TopicCollection
    members: MemberCollection
    invites: InviteCollection
    secrets: SecretCollection,
    messages: MessageCollection,
    interactions: InteractionCollection,
}

export default class Storage {
    public myUserId: string = ""
    public token: string = ""
    public db: RxDatabase<DatabaseCollections> = {} as any
    public saveMyUserId(id: string) {
        this.myUserId = id;
        localStorage.setItem("myUserId", id);
    }
    public saveToken(t: string) {
        this.token = t;
        localStorage.setItem("token", t);
    }
    public async run() {
        this.token = localStorage.getItem("token") ?? "";
        this.myUserId = localStorage.getItem("myUserId") ?? "";
        this.db = await createRxDatabase<DatabaseCollections>({
            name: 'sigma',
            storage: getRxStorageDexie(),
            password: 'sigma',             // <- password (optional)
            multiInstance: true,                // <- multiInstance (optional, default: true)
            eventReduce: true,                  // <- eventReduce (optional, default: false)
            cleanupPolicy: {}                   // <- custom cleanup policy (optional)
        });
        await this.db.addCollections({
            users: {
                schema: userSchema
            },
            sessions: {
                schema: sessionSchema
            },
            spaces: {
                schema: spaceSchema
            },
            topics: {
                schema: topicSchema
            },
            members: {
                schema: memberSchema
            },
            invites: {
                schema: inviteSchema
            },
            secrets: {
                schema: secretSchema
            },
            messages: {
                schema: messageSchema
            },
            interactions: {
                schema: interactionSchema
            }
        })
        this.db.$.subscribe(changeEvent => console.dir(changeEvent));
    }
}
