#!/bin/bash
cd /home/user/sigma-network/tests/bench
export VM_ITERS=500 VM_COUNTS=1,10,50,100,250 CONC=1,2,4,8,16,32,64,128 DUR=8s
export FED_ITERS=300 WS_ITERS=200 REC_ACTIONS=200
exec bash run_all.sh
