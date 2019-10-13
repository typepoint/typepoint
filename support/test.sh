SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$SCRIPT_PATH/../packages/$1"

cd "$PACKAGE_PATH"

cp "$ROOT_PATH/jest.config.json" "./"

yarn jest --config ./jest.config.json
