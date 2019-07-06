const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const Minimist = require('minimist');
const nunjucks = require('nunjucks');

const { path: filePath } = Minimist(process.argv.slice(2));

const render = promisify(nunjucks.render);
function getFilename(filepath) {
  const [ ext, file ] = filepath.split('.').reverse();

  const [ name ] = file.split('/').reverse();

  return name;
}

function init() {
  // TODO: Change this to the name of the file
  const BUILD_PATH = path.resolve(process.cwd(), 'dist');
  const content = fs.readFileSync(
    path.resolve(process.cwd(), filePath)
  ).toString();

  render(path.resolve(__dirname, './template.njk'), { md: content }).then( file => {

    if (!fs.existsSync()) {
      fs.mkdirSync(BUILD_PATH);
    }

    fs.writeFileSync(path.resolve(BUILD_PATH, './index.html'), file);
  });
}

init();
