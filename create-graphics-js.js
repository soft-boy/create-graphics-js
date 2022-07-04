#!/usr/bin/env node

import chalk from 'chalk';
import { execa } from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import Listr from 'listr';
import ncp from 'ncp';
import { promisify } from 'util';
const copy = promisify(ncp)

const [,, ...args] = process.argv

if (!args.length) {
	console.log('Please specify the project directory:')
	console.log('  '+chalk.blue('create-graphicsjs-game ')+chalk.green('<project-directory>\n'))
  process.exit()
}

const targetDir = args[0]
const currentUrl = import.meta.url
const templateDir = path.resolve(new URL(currentUrl).pathname, '../template');

const tasks = new Listr([
  {
    title: 'copying boilerplate',
    task: () => copy(templateDir, targetDir)
  },
  {
    title: 'running git init',
		task: async () => {
			const result = await execa('git', ['init'], {
				cwd: `${process.cwd()}/${targetDir}`
			});
			if (result.failed) {
				throw new Error(`Failed to initialize git.`)
			}
		}
  },
  {
		title: 'running npm init',
		task: async () => {
			const result = await execa('npm', ['init', '-y'], {
				cwd: `${process.cwd()}/${targetDir}`
			})
			if (result.failed) {
				throw new Error(`Failed to initialize package.json`)
			}
		}
	},
  {
    title: 'adding scripts to package.json',
    task: async () => {
      const scripts = {
        start: 'parcel index.html'
      }
      const browserslist = [
        'last 3 and_chr versions',
        'last 3 chrome versions',
        'last 3 opera versions',
        'last 3 ios_saf versions',
        'last 3 safari versions'
      ]
  
      const filename = `${targetDir}/package.json`
      const rawData = fs.readFileSync(filename);
      fs.unlinkSync(filename)
      const data = JSON.parse(rawData);
  
      const newData = { ...data, scripts, browserslist }
      const newJSONData = JSON.stringify(newData, null, 2)
      fs.writeFileSync(filename, newJSONData)
    }
  },
  {
    title: 'installing parcel',
    task: async () => {
			const result = await execa('npm', ['i', '-s', 'parcel-bundler'], {
				cwd: `${process.cwd()}/${targetDir}`
			})
			if (result.failed) {
				throw new Error(`Failed to install parcel bundler`)
			}
		}
  },
  {
    title: 'installing graphics.js',
    task: async () => {
			const result = await execa('npm', ['i', '-s', '@soft-boy/graphics.js'], {
				cwd: `${process.cwd()}/${targetDir}`
			})
			if (result.failed) {
				throw new Error(`Failed to install graphics.js`)
			}
		}
  }
])

await tasks.run()
console.log('%s Initialization Complete\n', chalk.green.bold('DONE'));
console.log('We suggest that you begin by typing:\n')
console.log('%s %s', chalk.blue('cd'), targetDir);
console.log('%s\n', chalk.blue('npm start'));
console.log('Make something fun :)');
