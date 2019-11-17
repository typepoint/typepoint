SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"

cd "$PACKAGE_PATH"

if test -f "$PACKAGE_PATH/package.json"; then
  cp "$PACKAGE_PATH/package.json" "$DIST_PATH/package.json"
fi

# Publish package to npm
GH_TOKEN=$TP_GITHUB_TOKEN NPM_TOKEN=$TP_NPM_TOKEN yarn semantic-release --no-ci
