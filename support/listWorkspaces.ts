/* eslint-disable no-console */
import * as chalk from 'chalk';
import { getWorkspacesMap, sortWorkspacesByDependency } from './common';

async function run() {
  const workspacesMap = await getWorkspacesMap();

  console.log();

  const workspaces = sortWorkspacesByDependency(Object.values(workspacesMap));

  workspaces.forEach((workspace) => {
    const isPrivate = Boolean(workspace.pkg.private);
    const defaultColor = isPrivate ? chalk.grey : (text: string) => text;
    const isPublished = workspace.latestPublishedVersion === workspace.pkg.version;
    const publishedMessage = isPrivate ? defaultColor(' (Private)') : ` (${
      isPublished
        ? chalk.green('Published')
        : chalk.yellow(`Not Published, latest is ${workspace.latestPublishedVersion}`)
    })`;
    const rootPipe = defaultColor(workspace.requiredWorkspaces.length ? '┬' : '─');
    console.log(`${rootPipe} ${defaultColor(`${workspace.name} - ${workspace.pkg.version}`)}${publishedMessage}`);

    workspace.requiredWorkspaces.forEach((requiredWorkspace, index) => {
      const isLast = index === workspace.requiredWorkspaces.length - 1;
      const versionFilter = requiredWorkspace.isInSync
        ? defaultColor(requiredWorkspace.versionFilter)
        : `${
          chalk.red(requiredWorkspace.versionFilter)
        } ${defaultColor('(Local is ')}${requiredWorkspace.workspace.pkg.version}${defaultColor(')')}`;
      const pipe = defaultColor(isLast ? '└─' : '├─');
      console.log(`${pipe} ${defaultColor(`${requiredWorkspace.workspace.name}@`)}${versionFilter}`);
    });
    console.log();
  });
}

run().catch(console.error);
