import * as fs from 'fs-extra';
import * as path from 'path';

function updateFile(fileName: string, replacer: (content: string) => string) {
  let content = fs.readFileSync(fileName, { encoding: 'utf8' });
  content = replacer(content);
  fs.writeFileSync(fileName, content);
}

function run() {
  const packageName = process.argv[2];

  if (!packageName) {
    console.log('Package name not specified');
    return;
  }

  const rootPath = path.dirname(__dirname);
  const sourceFileName = `${rootPath}/packages/${packageName}/package.json`;
  const destinationFileName = `${__dirname}/../packages/${packageName}/dist/package.json`;
  fs.copyFileSync(sourceFileName, destinationFileName);

  updateFile(destinationFileName, (content) => {
    const packageObj = JSON.parse(content);
    const fieldsToRemove = [
      'devDependencies',
      'precommit',
      'private',
      'scripts',
    ];
    fieldsToRemove.forEach((fieldToRemove) => {
      delete packageObj[fieldToRemove];
    });

    const { main, types } = packageObj;

    if (typeof main === 'string') {
      packageObj.main = main
        .replace(/^src\//, '')
        .replace(/\.ts$/, '.js');
    }
    if (typeof types === 'string') {
      packageObj.types = types.replace(/^src\//, '');
    }

    return JSON.stringify(packageObj, null, '  ');
  });
}

run();
