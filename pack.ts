import * as fs from 'fs-extra';
import * as path from 'path';

const packagePath = path.join(__dirname, 'dist');

function copyFileToPackage(fileName: string, destinationSubDirectoryPath: string = ''): void {
  const destinationDirectoryPath = (
    destinationSubDirectoryPath ?
      path.join(packagePath, destinationSubDirectoryPath) :
      packagePath
  );
  fs.mkdirpSync(destinationDirectoryPath);

  const sourceFileName = path.join(__dirname, fileName);
  const destinationFileName = path.join(destinationDirectoryPath, path.basename(sourceFileName));
  fs.copyFileSync(sourceFileName, destinationFileName);
}

function updateFile(fileName: string, replacer: (content: string) => string) {
  const fullFileName = path.join(packagePath, fileName);
  let content = fs.readFileSync(fullFileName, { encoding: 'utf8' });
  content = replacer(content);
  fs.writeFileSync(fullFileName, content);
}

function run() {
  copyFileToPackage('package.json');
  copyFileToPackage('README.md');

  updateFile('package.json', content => {
    const packageObj = JSON.parse(content);
    const fieldsToRemove = [
      'devDependencies',
      'nyc',
      'precommit',
      'private',
      'scripts'
    ];
    for (const fieldToRemove of fieldsToRemove) {
      delete packageObj[fieldToRemove];
    }
    return JSON.stringify(packageObj, null, '  ');
  });
}

run();
