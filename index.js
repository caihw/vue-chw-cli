#!/usr/bin/env node
/**
 * Created by mapbar_front on 2020-12-02.
 */
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
program.version('1.0.0', '-v, --version')
    .command('create <name>')
    .action((name) => {
        if(!fs.existsSync(name)){
            inquirer.prompt([
                {
                    name: 'name',
                    message: '请输入项目名称：'
                },
                {
                    name: 'description',
                    message: '请输入项目描述：'
                },
                {
                    name: 'author',
                    message: '请输入作者名称：'
                },
                {
                    type: 'list',
                    message: '选择组件库:',
                    name: 'template',
                    choices: [
                        "Element",
                        "Ant Design of Vue"
                    ]
                },
                {
                    type: 'confirm',
                    name: 'cssStyle',
                    message: '是否使用CSS Pre-processors：'
                },
                {
                    type: 'list',
                    message: '选择css预处理器:',
                    name: 'preprocessor',
                    choices: [
                        "SASS",
                        "LESS",
                        "Stylus"
                    ],
                    when: function (answers) { // 当watch为true的时候才会提问当前问题
                        return answers.cssStyle
                    }
                },
            ]).then((answers) => {
                let params = {
                    name: answers.name,
                    description: answers.description,
                    author: answers.author
                }
                if (answers.cssStyle) {
                    if (answers.preprocessor === 'SASS') {
                        params.less = false;
                        params.sass = true;
                        params.stylus = false;
                    } else if (answers.preprocessor === 'LESS') {
                        params.less = true;
                        params.sass = false;
                        params.stylus = false;
                    } else if (answers.preprocessor === 'Stylus') {
                        params.less = false;
                        params.sass = false;
                        params.stylus = true;
                    }
                    params.nopreprocessor = false;
                } else {
                    params.sass = false;
                    params.less = false;
                    params.stylus = false;
                    params.nopreprocessor = true;
                }
                if (answers.template === 'Element') {
                    params.element = true;
                    params.antdesign = false;
                } else if (answers.template === 'Ant Design of Vue') {
                    params.element = false;
                    params.antdesign = true;
                }
                const spinner = ora('正在下载模板...');
                spinner.start();
                const TEMPLATE = 'https://github.com:caihw/chw-vue-template#main';
                download(TEMPLATE, name, {clone: true}, (err) => {
                    if(err){
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                    }else{
                        let packagePath = `${name}/package.json`;
                        let packageStr = fs.readFileSync(packagePath, 'utf-8');
                        let package = handlebars.compile(packageStr)(params);
                        fs.writeFileSync(packagePath, package);
                        let mainPath = `${name}/src/main.js`;
                        let mainStr = fs.readFileSync(mainPath, 'utf-8');
                        let main = handlebars.compile(mainStr)(params);
                        fs.writeFileSync(mainPath, main);
                        let AppVuePath = `${name}/src/App.vue`;
                        let AppVueStr = fs.readFileSync(AppVuePath, 'utf-8');
                        let AppVue = handlebars.compile(AppVueStr)(params);
                        fs.writeFileSync(AppVuePath, AppVue);
                        if (params.sass) {
                            const npmrcPath = `${name}/.npmrc`;
                            const appendContent = '\r\nsass_binary_site=https://npm.taobao.org/mirrors/node-sass/'
                            if (!fs.existsSync(npmrcPath)) {
                                fs.writeFileSync(npmrcPath, appendContent)
                            } else {
                                fs.appendFileSync(npmrcPath, appendContent)
                            }
                        }

                        spinner.text = '下载成功';
                        spinner.color = '#1C88B8';
                        spinner.succeed();
                        console.log("");
                        console.log(" # cd into Project");
                        console.log(chalk.rgb(28, 136, 184)('   $ ') + chalk.rgb(28, 136, 184)(`cd ${name}`));
                        console.log("");
                        console.log(" # Project setup");
                        console.log(chalk.rgb(28, 136, 184)('   $ ') + chalk.rgb(28, 136, 184)(`npm install`));
                        console.log("");
                        console.log(" # Compiles and hot-reloads for development");
                        console.log(chalk.rgb(28, 136, 184)('   $ ') + chalk.rgb(28, 136, 184)(`npm run serve`));
                        console.log("");
                        console.log(" # Compiles and minifies for production");
                        console.log(chalk.rgb(28, 136, 184)('   $ ') + chalk.rgb(28, 136, 184)(`npm run build`));
                        console.log("")
                    }
                })
            })
        }else{
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);