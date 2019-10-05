declare module 'global' {
  const global: { console: Console };
  export = global;
}