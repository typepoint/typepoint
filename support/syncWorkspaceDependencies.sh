SCRIPT_PATH=$(dirname "$0")
WORKSPACE_SHORT_NAME=$1

yarn ts-node "$SCRIPT_PATH/syncWorkspaceDependencies.ts" $WORKSPACE_SHORT_NAME
