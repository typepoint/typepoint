SCRIPT_PATH=$(dirname "$0")

echo "--------------------------------"
echo "Validating $1"
echo "--------------------------------"

"$SCRIPT_PATH/lint.sh" $1 || exit 1
"$SCRIPT_PATH/build.sh" $1 || exit 1
"$SCRIPT_PATH/test.sh" $1 || exit 1
