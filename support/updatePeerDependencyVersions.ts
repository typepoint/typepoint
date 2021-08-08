/* eslint-disable no-console */
import chalk = require('chalk');
import { getWorkspacesMap, Workspace, WorkspacesMap } from './common';

const updatePeerDependencies = async (workspace: Workspace, workspaces: WorkspacesMap) => {
  const updatedPeerDependencies = { ...workspace.pkg.peerDependencies };
  const updatedDevDependencies = { ...workspace.pkg.devDependencies };
  let changed = false;

  Object.entries(workspace.pkg.peerDependencies ?? {})
    .filter(([dependencyName]) => dependencyName.startsWith('@typepoint/'))
    .forEach(([dependencyName, dependencyVersion]) => {
      const versionToUse = workspaces[dependencyName].pkg.version;

      if (dependencyVersion !== versionToUse) {
        updatedPeerDependencies[dependencyName] = versionToUse;
        changed = true;
      }
    });

  Object.entries(workspace.pkg.devDependencies ?? {})
    .filter(([dependencyName]) => dependencyName.startsWith('@typepoint/'))
    .forEach(([dependencyName, dependencyVersion]) => {
      const versionToUse = workspaces[dependencyName].pkg.version;

      if (dependencyVersion !== versionToUse) {
        updatedDevDependencies[dependencyName] = versionToUse;
        changed = true;
      }
    });

  if (changed) {
    const updatedPackage = {
      ...workspace.pkg,
      devDependencies: Object.values(updatedDevDependencies).length ? updatedDevDependencies : undefined,
      peerDependencies: Object.values(updatedPeerDependencies).length ? updatedPeerDependencies : undefined,
    };
    await workspace.updatePackage(updatedPackage);
  }
};

async function run() {
  const workspaces = await getWorkspacesMap();
  await Promise.all(
    Object.values(workspaces).map(async (workspace) => {
      await updatePeerDependencies(workspace, workspaces);
    }),
  );
}

run();
