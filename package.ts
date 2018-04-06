import * as fs from 'fs-extra';
import * as path from 'path';

const packagePath = path.join(__dirname, 'package');

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

function copyDirectoryContentsToPackage(sourceDirectoryPath: string, destinationDirectoryPath: string = '') {
  sourceDirectoryPath = path.join(__dirname, sourceDirectoryPath);
  destinationDirectoryPath = destinationDirectoryPath ? path.join(packagePath, destinationDirectoryPath) : packagePath;
  fs.copySync(sourceDirectoryPath, destinationDirectoryPath);
}

function updateFile(fileName: string, replacer: (content: string) => string) {
  const fullFileName = path.join(packagePath, fileName);
  let content = fs.readFileSync(fullFileName, { encoding: 'utf8' });
  content = replacer(content);
  fs.writeFileSync(fullFileName, content);
}

function run() {
  if (fs.existsSync(packagePath)) {
    fs.emptyDirSync(packagePath);
  }

  copyFileToPackage('package.json');

  copyFileToPackage('README.md');

  copyFileToPackage('.npmignore');

  copyDirectoryContentsToPackage('dist');

  updateFile('package.json', content => {
    const packageObj = JSON.parse(content);
    packageObj.private = false;
    return JSON.stringify(packageObj, null, '  ');
  });
}

run();
