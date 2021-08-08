/*
  This script parses all the source files in each yarn workspace and verifies that no library
  is using a relative import to access a file outside its own library.
  e.g.
    `packages/client/src/index.ts` should not import `../../shared/src/index.ts`
    Instead it should import `@typepoint/shared`. Relative paths will not work outisde of this monorepo.
*/

/* eslint-disable no-console */
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Bluebird from 'bluebird';
import { flatten } from 'lodash';
import * as chalk from 'chalk';
import * as glob from 'glob';
import lineColumn = require('line-column');
import { getWorkspacesMap } from './common';

async function findFiles(pattern: string) {
  return new Promise<string[]>((resolve, reject) => {
    glob(pattern, (err, matches) => (err ? reject(err) : resolve(matches)));
  });
}

async function getImportedPathsForFile(fileName: string) {
  const result: {
    col: number;
    fileName: string;
    line: number;
  }[] = [];
  const source = await fs.readFile(fileName, 'utf-8');
  const regExp = /(?:from '(.+?)';)|(?:require\('(.+)'\))/g;
  const lineColumnTranslator = lineColumn(source);
  let match = regExp.exec(source);
  while (match && match[1]) {
    const index = regExp.lastIndex - match[0].length;
    const { col, line } = lineColumnTranslator.fromIndex(index) || { line: 1, col: 1 };
    result.push({
      col,
      fileName: match[1],
      line,
    });
    match = regExp.exec(source);
  }
  return result;
}

async function getInvalidImportsInFile(fileName: string, packagePath: string) {
  const imports = await getImportedPathsForFile(fileName);
  const relativeImports = imports.filter(({ fileName: importFileName }) => importFileName.startsWith('.'));
  const absoluteImports = relativeImports.map(({ col, line, fileName: importFileName }) => ({
    col,
    line,
    fileName: path.resolve(
      path.join(
        path.dirname(fileName),
        importFileName,
      ),
    ),
  }));
  const absolutePackagePath = path.resolve(packagePath);
  return absoluteImports.filter(({ fileName: importFileName }) => !importFileName.startsWith(absolutePackagePath));
}

async function run() {
  const workspacesByName = await getWorkspacesMap();
  const entries = Object.entries(workspacesByName);

  const allInvalidImports = flatten(await Bluebird.map(
    entries,
    async ([, workspace]) => {
      const sourceFileNames = await findFiles(`${workspace.location}/**/*.{ts,tsx}`);
      const invalidImportsInWorkspace = flatten(await Bluebird.map(
        sourceFileNames,
        async (sourceFileName) => {
          const invalidImports = await getInvalidImportsInFile(sourceFileName, workspace.location);
          return {
            fileName: sourceFileName,
            invalidImports,
          };
        },
        {
          concurrency: 5,
        },
      ));

      return invalidImportsInWorkspace;
    },
  ));

  let hasInvalidImports = false;

  allInvalidImports.forEach(({ fileName, invalidImports }) => {
    invalidImports.forEach(({ line, fileName: importFileName }) => {
      console.error(chalk.red(`Found invalid import in ${fileName}:${line} ${importFileName}`));
      hasInvalidImports = true;
    });
  });

  if (hasInvalidImports) {
    process.exit(1);
  }
}

run().then(null, (err) => {
  console.error(err.message || err);
  process.exit(1);
});
