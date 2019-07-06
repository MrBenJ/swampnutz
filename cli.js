#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');
const Minimist = require('minimist');
const nunjucks = require('nunjucks');
const marked = require('marked');

const render = promisify(nunjucks.renderString);
const toMarkdown = promisify(marked);

function showHelp() {
  console.log(chalk.bold.white('swampnutz usage: \n'));
  console.log(chalk.green('  swampnutz your_markdown_file --title "Your page title"\n '));
  console.log(chalk.green('    --title is optional\n\n'));
  console.log(chalk.bold.white('Made with <3 by @MrBenJ (https://www.github.com/MrBenJ\n'));
}

function init() {
  const md = process.argv[2];
  const { title } = Minimist(process.argv.slice(2));

  if (!md) {
    // Show help
    showHelp();
    return;
  }

  const BUILD_PATH = path.resolve(process.cwd(), '.swampnutz');
  const rawMarkdown = fs.readFileSync(
    path.resolve(process.cwd(), md)
  ).toString();

  toMarkdown(rawMarkdown)
    .then( content => {
      const template =
        fs.readFileSync(path.resolve(__dirname, 'template.njk')).toString();

      return Promise.resolve(
        render(template, { content, title })
      );
    })
    .then(file => {
      if (!fs.existsSync()) {
        fs.mkdirSync(BUILD_PATH);
      }

      fs.writeFileSync(path.resolve(BUILD_PATH, './index.html'), file);

      const child = spawn('npx', ['surge'],
        {
          cwd: path.resolve(process.cwd(), '.swampnutz'),
          stdio: 'inherit'
        }
      );

      child.on('exit', () => {
        fs.unlinkSync(path.resolve(process.cwd(), '.swampnutz/index.html'));
        fs.rmdir(path.resolve(process.cwd(), '.swampnutz'), error => {
          if (error) { throw error; }
          process.exit(0);
        });
      });
    });
}

init();
