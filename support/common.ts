import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as semver from 'semver';

export type DependenciesType = 'dependencies' | 'devDependencies' | 'peerDependencies';

export type PackageDependencies = {
  [name: string]: string;
}

export type Package = {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: PackageDependencies;
  devDependencies?: PackageDependencies;
  peerDependencies?: PackageDependencies;
}

export type RequiredWorkspace = {
  versionFilter: string;
  dependenciesType: DependenciesType;
  workspace: Workspace;
  isInSync: boolean;
}

export type Workspace = {
  name: string;
  location: string;
  latestPublishedVersion: string;
  pkg: Package;
  requiredWorkspaces: RequiredWorkspace[];
  updatePackage: (pkg: Package) => Promise<void>;
}

export type WorkspacesMap = {
  [name: string]: Workspace;
}

async function getLatestPublishedPackageVersion(packageName: string) {
  return new Promise<string>((resolve, reject) => {
    exec(`yarn info ${packageName} --silent`, (err, stdout) => {
      if (err) {
        return reject(err);
      }
      try {
        const latestVersionExtractor = /'dist-tags':\s*{[^}]*latest:\s*['"]([^'"]+)['"][^}]+}/gim;
        const match = latestVersionExtractor.exec(stdout);
        const latestVersion = match && match[1];
        if (!latestVersion) {
          return reject(new Error(`Could not determine latest published version for: ${packageName}`));
        }
        return resolve(latestVersion);
      } catch (err2) {
        return reject(err2);
      }
    });
  });
}

function getWorkspaceDependencies(workspacesMap: WorkspacesMap, workspace: Workspace) {
  const getDependencyVersionFilter = (
    dependencies: PackageDependencies | undefined,
    dependenciesType: DependenciesType,
    packageName: string,
  ): RequiredWorkspace | undefined => {
    const versionFilter = dependencies && dependencies[packageName];
    if (!versionFilter) {
      return undefined;
    }

    const requiredWorkspace = workspacesMap[packageName];

    return {
      versionFilter,
      dependenciesType,
      workspace: requiredWorkspace,
      isInSync: semver.satisfies(requiredWorkspace.pkg.version, versionFilter),
    };
  };

  const requiredWorkspaces = Object
    .values(workspacesMap)
    .filter((otherWorkspace) => otherWorkspace !== workspace)
    .map((otherWorkspace) => {
      const requiredWorkspace = (
        getDependencyVersionFilter(workspace.pkg.dependencies, 'dependencies', otherWorkspace.name)
        || getDependencyVersionFilter(workspace.pkg.devDependencies, 'devDependencies', otherWorkspace.name)
        || getDependencyVersionFilter(workspace.pkg.peerDependencies, 'peerDependencies', otherWorkspace.name)
      );

      return requiredWorkspace;
    })
    .filter(Boolean) as RequiredWorkspace[];


  return requiredWorkspaces;
}

export async function loadPackageJson(filename: string) {
  const json = await fs.readFile(filename, 'utf-8');
  return JSON.parse(json) as Package;
}

export async function getWorkspacesMap(): Promise<WorkspacesMap> {
  type YarnWorkspacesInfo = {
    [packageName: string]: {
      location: string;
    };
  }

  const workspacesInfo = await new Promise<{ [name: string]: { location: string } }>((resolve, reject) => {
    exec('yarn workspaces info --silent', (err, stdout) => {
      if (err) {
        return reject(err);
      }
      try {
        const result = JSON.parse(stdout) as YarnWorkspacesInfo;
        return resolve(result);
      } catch (err2) {
        return reject(err2);
      }
    });
  });

  const workspaces = await Promise.all(
    Object
      .entries(workspacesInfo)
      .map(async ([name, { location }]) => {
        const packageFilename = path.join(path.dirname(__dirname), location, 'package.json');
        const pkg = await loadPackageJson(packageFilename);
        const latestPublishedVersion = pkg.private
          ? ''
          : await getLatestPublishedPackageVersion(name);
        const updatePackage = async (updatedPackage: Package) => {
          await fs.writeFile(packageFilename, `${JSON.stringify(updatedPackage, null, '  ')}\n`, 'utf-8');
        };
        return {
          name,
          latestPublishedVersion,
          location,
          pkg,
          requiredWorkspaces: [],
          mismatchedDependencies: [],
          updatePackage,
        } as Workspace;
      }),
  );

  const workspacesByName = workspaces.reduce(
    (map, workspace) => ({
      ...map,
      [workspace.name]: workspace,
    }),
    {} as { [name: string]: Workspace },
  );

  Object
    .values(workspacesByName)
    .forEach((workspace) => {
      const requiredWorkspaces = getWorkspaceDependencies(workspacesByName, workspace);
      workspace.requiredWorkspaces = requiredWorkspaces;
    });

  return workspacesByName;
}

export function sortWorkspacesByDependency(workspaces: Workspace[]) {
  const result: Workspace[] = [];

  const workspacesToVisit = [...workspaces];

  const visit = (workspace: Workspace) => {
    const index = workspacesToVisit.indexOf(workspace);
    if (index === -1) {
      return;
    }

    workspacesToVisit.splice(index, 1);

    (workspace.requiredWorkspaces || []).forEach((dependency) => visit(dependency.workspace));

    result.unshift(workspace);
  };

  while (workspacesToVisit.length) {
    const workspace = workspacesToVisit[0];
    if (!workspace) {
      throw new Error('Unexpected null while sorting workspaces');
    }
    visit(workspace);
  }

  return result.reverse();
}
