/* eslint-disable no-console */
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  getWorkspaces, loadPackageJson, Workspace, NodePackageDependencies,
} from './common';

async function run() {
  const workspaceNameToUpdate = `@typepoint/${process.argv[2] || ''}`;

  const workspacesByName = await getWorkspaces();
  const workspace = workspacesByName[workspaceNameToUpdate];

  if (!workspace) {
    throw new Error(`No workspace found named "${workspaceNameToUpdate}"`);
  }

  const pkg = await loadPackageJson(workspace.packageFilename);

  const updateDependencyVersion = (deps: NodePackageDependencies | undefined, name: string, version: string) => {
    if (deps && deps[name]) {
      deps[name] = version;
    }
  };

  await Promise.all(workspace.mismatchedWorkspaceDependencies.map(async (mismatchedWorkspaceName) => {
    const mismatchedWorkspace = workspacesByName[mismatchedWorkspaceName];
    const latestVersion = mismatchedWorkspace.version;
    updateDependencyVersion(pkg.dependencies, mismatchedWorkspaceName, latestVersion);
    updateDependencyVersion(pkg.devDependencies, mismatchedWorkspaceName, latestVersion);
    updateDependencyVersion(pkg.peerDependencies, mismatchedWorkspaceName, latestVersion);
  }));

  await fs.writeFile(workspace.packageFilename, JSON.stringify(pkg, null, '  '), 'utf-8');
}

run().then(null, (err) => {
  console.error(err.message || err);
  process.exit(1);
});
