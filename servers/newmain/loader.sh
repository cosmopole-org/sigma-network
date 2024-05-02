#!/bin/bash

PORT=8080 ./main &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
