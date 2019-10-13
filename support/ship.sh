SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"

cd "$PACKAGE_PATH"

# Push CHANGE_LOG and package.json changes up to origin/master
git push --follow-tags origin master

# Publish package to npm
cd ./dist
yarn publish

# Clean the dist folder
cd ..
yarn run clean
