SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"
DIST_PATH="$PACKAGE_PATH/dist"

cd "$PACKAGE_PATH"

# Pull down latest code from origin/master
git checkout master
git pull origin master

"$SCRIPT_PATH/verify.sh" $1

# Run standard-version for this package
# to update CHANGE_LOG, and package.json version
yarn standard-version --path "$PACKAGE_PATH"

# Copy the package.json to the dist folder again
# now that standard-version has updated the version
yarn ts-node "$ROOT_PATH/support/copyPackage.ts" $1

if test -d "$DIST_PATH"; then
  if test -f "$PACKAGE_PATH/CHANGELOG.md"; then
    cp "$PACKAGE_PATH/CHANGELOG.md" "$DIST_PATH/CHANGELOG.md"
  fi
fi
