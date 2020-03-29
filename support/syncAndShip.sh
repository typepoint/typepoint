SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"
PACKAGE_NAME="@typepoint/$1"

cd "$PACKAGE_PATH"

yarn workspace $PACKAGE_NAME sync-workspace-dependencies
git add "$PACKAGE_PATH/package.json"
git commit -m "fix: update package dependencies"
git push
yarn workspace $PACKAGE_NAME ship
