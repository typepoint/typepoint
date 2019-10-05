export function argumentsToArray(args: IArguments): any[] {
  const result: any[] = [];
  // tslint:disable-next-line:prefer-for-of
  for (let index = 0; index < args.length; index++) {
    result.push(args[index]);
  }
  return result;
}
