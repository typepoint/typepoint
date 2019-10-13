SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"

cd "$PACKAGE_PATH"

yarn eslint -c "$ROOT_PATH/.eslintrc.js" ./src/**/* --ext .js,.jsx,.ts,.tsx --format visualstudio
