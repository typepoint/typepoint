import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';

export interface Workspace {
  location: string;
  packageFilename: string;
  version: string;
  workspaceDependencies: string[];
  mismatchedWorkspaceDependencies: string[];
}

export interface WorkspacesByName {
  [name: string]: Workspace;
}

export async function getWorkspaces(): Promise<WorkspacesByName> {
  const workspaces = await new Promise<WorkspacesByName>((resolve, reject) => {
    exec('yarn workspaces info --silent', (err, stdout) => {
      if (err) {
        return reject(err);
      }
      try {
        const result = JSON.parse(stdout) as WorkspacesByName;
        return resolve(result);
      } catch (err2) {
        return reject(err2);
      }
    });
  });

  await Promise.all(
    Object
      .entries(workspaces)
      .map(async ([workspaceName, workspace]) => {
        const packageFilename = path.join(
          path.dirname(__dirname),
          workspace.location,
          'package.json',
        );
        const { version } = JSON.parse(await fs.readFile(packageFilename, 'utf-8'));
        workspaces[workspaceName] = {
          ...workspaces[workspaceName],
          packageFilename,
          version,
        };
      }),
  );

  return workspaces;
}

export interface NodePackageDependencies {
  [name: string]: string;
}

export interface NodePackage {
  name: string;
  version: string;
  dependencies?: NodePackageDependencies;
  devDependencies?: NodePackageDependencies;
  peerDependencies?: NodePackageDependencies;
}

export async function loadPackageJson(filename: string) {
  const json = await fs.readFile(filename, 'utf-8');
  return JSON.parse(json) as NodePackage;
}
