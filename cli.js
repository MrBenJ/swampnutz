#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const Minimist = require('minimist');
const nunjucks = require('nunjucks');
const marked = require('marked');

const render = promisify(nunjucks.render);
const toMarkdown = promisify(marked);

function init() {
  const md = process.argv[2];
  const { title } = Minimist(process.argv.slice(2));

  const BUILD_PATH = path.resolve(process.cwd(), '.swampnutz');
  const rawMarkdown = fs.readFileSync(
    path.resolve(process.cwd(), md)
  ).toString();

  toMarkdown(rawMarkdown)
    .then( content => {
      return Promise.resolve(
        render( path.resolve(__dirname, './template.njk'), { content, title })
      );
    })
    .then(file => {
      if (!fs.existsSync()) {
        fs.mkdirSync(BUILD_PATH);
      }

      fs.writeFileSync(path.resolve(BUILD_PATH, './index.html'), file);

      const child = spawn('surge',
        {
          cwd: path.resolve(process.cwd(), '.swampnutz'),
          stdio: 'inherit'
        });




      // child.on('exit', code => {
      //   return code;
      // });
    });
}

init();
