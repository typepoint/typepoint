SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"
PACKAGE_NAME="@typepoint/$1"

cd "$PACKAGE_PATH"

yarn workspace $PACKAGE_NAME sync-workspace-dependencies
git add "$PACKAGE_PATH/package.json"
STAGED_FILES=$(git diff --name-only --cached)
if [ ! -z "$STAGED_FILES" ]
then
  git commit -m "fix: update package dependencies" --no-verify
  git push
fi
yarn workspace $PACKAGE_NAME ship
