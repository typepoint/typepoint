const removeLeadingAndTrailingSlashes = (
  (path: string) => path
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
);

export class PathBuilder<TRequestParams> {
  private readonly parts: string[] = [];

  // Marked as private to discourage consumers from instantiating directly.
  // Use the createPath function instead
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {
  }

  literal(path: string): PathBuilder<TRequestParams> {
    if (path) {
      this.parts.push(removeLeadingAndTrailingSlashes(path));
    }
    return this;
  }

  param(name: keyof TRequestParams): PathBuilder<TRequestParams> {
    if (name) {
      this.parts.push(`:${name}`);
    }
    return this;
  }

  toString() {
    return `/${this.parts.join('/')}`;
  }
}

export type PathBuildingFunction<TRequestParams> = (path: PathBuilder<TRequestParams>) => PathBuilder<TRequestParams>;

export function createPath<TRequestParams>(build: PathBuildingFunction<TRequestParams>): string {
  class ConstructablePathBuilder extends PathBuilder<TRequestParams> {
    public constructor() {
      super();
    }
  }
  const pathBuilder = build(new ConstructablePathBuilder());
  return pathBuilder.toString();
}
