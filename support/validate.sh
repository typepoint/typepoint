SCRIPT_PATH=$(dirname "$0")

"$SCRIPT_PATH/lint.sh" $1
"$SCRIPT_PATH/build.sh" $1
"$SCRIPT_PATH/test.sh" $1
