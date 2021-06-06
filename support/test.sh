SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"
FILE_TO_TEST="$2"

cd "$PACKAGE_PATH"

JEST_CONFIG_FILE_NAME="$PACKAGE_PATH/jest.config.js"
if test -f "$JEST_CONFIG_FILE_NAME"
then
  yarn jest --config "$JEST_CONFIG_FILE_NAME" "$FILE_TO_TEST" || exit 1
fi

