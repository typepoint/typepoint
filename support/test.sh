SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"

cd "$PACKAGE_PATH"

JEST_CONFIG_FILE_NAME="$PACKAGE_PATH/jest.config.json"
JEST_JS_CONFIG_FILE_NAME="$PACKAGE_PATH/jest.config.js"
if test -f "$JEST_JS_CONFIG_FILE_NAME"
then
  JEST_CONFIG_FILE_NAME="$JEST_JS_CONFIG_FILE_NAME"
else
  cp "$ROOT_PATH/jest.config.json" "./"
fi

yarn jest --config "$JEST_CONFIG_FILE_NAME"
