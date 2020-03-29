/* eslint-disable no-console */
import * as chalk from 'chalk';
import { getWorkspacesMap, PackageDependencies } from './common';

async function run() {
  const workspaceNameToUpdate = `@typepoint/${process.argv[2] || ''}`;

  const workspacesByName = await getWorkspacesMap();
  const workspace = workspacesByName[workspaceNameToUpdate];

  if (!workspace) {
    throw new Error(`No workspace found named "${workspaceNameToUpdate}"`);
  }

  const updateDependencyVersion = (deps: PackageDependencies | undefined, name: string, version: string) => {
    if (deps && deps[name]) {
      deps[name] = version;
    }
  };

  await Promise.all(
    workspace
      .requiredWorkspaces
      .filter((dependency) => !dependency.isInSync)
      .map(async (mismatchedWorkspace) => {
        const localVersion = mismatchedWorkspace.workspace.pkg.version;
        const mismatchedPackageName = mismatchedWorkspace.workspace.name;
        const updatedPackage = { ...workspace.pkg };
        updateDependencyVersion(updatedPackage.dependencies, mismatchedPackageName, localVersion);
        updateDependencyVersion(updatedPackage.devDependencies, mismatchedPackageName, localVersion);
        updateDependencyVersion(updatedPackage.peerDependencies, mismatchedPackageName, localVersion);
        workspace.pkg = updatedPackage;
      }),
  );

  workspace.updatePackage(workspace.pkg);
}

run().then(null, (err) => {
  console.error(chalk.red(err.message || err));
  process.exit(1);
});
