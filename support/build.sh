SCRIPT_PATH=$(dirname "$0")
ROOT_PATH="$SCRIPT_PATH/.."
PACKAGE_PATH="$ROOT_PATH/packages/$1"

cd "$PACKAGE_PATH"

"$SCRIPT_PATH/clean.sh" $1

TS_BUILD_INFO_PATH="$PACKAGE_PATH/tsconfig.tsbuildinfo"
if test -f "$TS_BUILD_INFO_PATH"; then
  rm "$TS_BUILD_INFO_PATH"
fi

yarn tsc

cp ./README.md ./dist

cp "$ROOT_PATH/LICENSE" ./dist

yarn ts-node "$ROOT_PATH/support/copyPackage.ts" $1
