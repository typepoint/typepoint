import * as fs from 'fs-extra';

function updateFile(fileName: string, replacer: (content: string) => string) {
  let content = fs.readFileSync(fileName, { encoding: 'utf8' });
  content = replacer(content);
  fs.writeFileSync(fileName, content);
}

function run() {
  const packagePath = process.cwd();
  const sourceFileName = `${packagePath}/package.json`;
  const destinationFileName = `${packagePath}/dist/package.json`;
  fs.copyFileSync(sourceFileName, destinationFileName);

  updateFile(destinationFileName, (content) => {
    const packageObj = JSON.parse(content);
    const fieldsToRemove = [
      'devDependencies',
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
        .replace(/\.ts$/, '.js')
        .replace(/\.tsx$/, '.js');
    }
    if (typeof types === 'string') {
      packageObj.types = types.replace(/^src\//, '');
    }

    return JSON.stringify(packageObj, null, '  ');
  });
}

run();
