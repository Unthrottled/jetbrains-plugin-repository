import readline from 'readline';
import path from "path";
import fs from 'fs';
import {spawn} from "child_process";
import xmlParser from 'xml2json'
import xmlFormatter from 'xml-formatter'

const dokiThemeRepo = path.resolve(__dirname, '..', '..', 'themed-components');

const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const runCommand = (command: string, env: { [key: string]: string } = {}) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, {
      cwd: dokiThemeRepo,
      env: {
        ...process.env,
        ...env,
      }
    });

    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);

    childProcess.on('close', () => {
      resolve();
    })
  })
};

readLineInterface.on('close', () => process.exit(0))

const templateDir = path.resolve(__dirname, 'templates');
const canaryDir = path.resolve(__dirname, '..', 'canary');
const communityDir = path.resolve(__dirname, '..');
const communityAssetsDir = path.resolve(__dirname, '..', 'themed-components');

function toXml(xml1: string) {
  return JSON.parse(
    xmlParser.toJson(
      xml1));
}

const readWriteTemplate = (
  template: string,
  destinationDir: string,
  version: string
) => {
  const versionedTemplate = toXml(fs.readFileSync(path.resolve(templateDir, template), {
    encoding: 'utf8'
  }).replace(/{{version}}/g, version));

  const updatePluginXmlAsJson = toXml(fs.readFileSync(path.resolve(destinationDir, 'updatePlugins.xml'), {
    encoding: 'utf8'
  }));

  updatePluginXmlAsJson.plugins.plugin = updatePluginXmlAsJson.plugins.plugin.filter((p: any) => p.id !== updatePluginXmlAsJson.id)

  updatePluginXmlAsJson.plugins.plugin.push(versionedTemplate.plugin)

  fs.writeFileSync(path.resolve(destinationDir, 'updatePlugins.xml'),
    xmlFormatter(xmlParser.toXml(
      JSON.stringify(updatePluginXmlAsJson)
      )), 'utf8');
}

const askQuestion = (question: string): Promise<string> =>
  new Promise<string>(resolve => readLineInterface.question(question, resolve));

askQuestion("Which version?\n")
  .then(versionNumber => askQuestion("Which channel (canary, all)\n")
    .then(channel => ({
      versionNumber,
      channel,
    }))
  )
  .then(({channel, versionNumber}) => {
      readWriteTemplate("themedComponentsTemplate.xml", canaryDir, versionNumber);
      if (channel === 'all') {
        readWriteTemplate("themedComponentsTemplate.xml", communityDir, versionNumber);
      }
      return runCommand('./ciScripts/buildPlugin.sh')
        .then(() => ({
          versionNumber
        }));
    }
  )
  .then(({versionNumber}) => {
    fs.copyFileSync(
      path.resolve(dokiThemeRepo, 'build', 'distributions', `themed-components-${versionNumber}.zip`),
      path.resolve(communityAssetsDir, `themed-components.${versionNumber}.zip`)
    )

    readLineInterface.close();
  }).catch((e) => {
  console.error(e)
  readLineInterface.close()
});
