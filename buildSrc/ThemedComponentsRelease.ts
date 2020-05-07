import readline from 'readline';
import path from "path";
import fs from 'fs';
import {spawn} from "child_process";
import xmlParser from 'xml2js'

const dokiThemeRepo = path.resolve(__dirname, '..', '..', 'themed-components');

const xmlBuilder = new xmlParser.Builder();

const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
export const runCommand = (command: string, env: { [key: string]: string } = {}) => {
  return new Promise((resolve) => {
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

const toXml = (xml1: string) =>
  xmlParser.parseStringPromise(xml1)

const readWriteTemplate = async (
  template: string,
  destinationDir: string,
  version: string
) => {
  const versionedTemplate = await toXml(fs.readFileSync(path.resolve(templateDir, template), {
    encoding: 'utf8'
  }).replace(/{{version}}/g, version));

  const updatePluginXmlAsJson = await toXml(fs.readFileSync(path.resolve(destinationDir, 'updatePlugins.xml'), {
    encoding: 'utf8'
  }));

  updatePluginXmlAsJson.plugins.plugin = updatePluginXmlAsJson.plugins.plugin
    .filter((p: any) => p.$.id !== versionedTemplate.plugin.$.id)

  updatePluginXmlAsJson.plugins.plugin.push(versionedTemplate.plugin)

  const xml = xmlBuilder.buildObject(updatePluginXmlAsJson);
  fs.writeFileSync(path.resolve(destinationDir, 'updatePlugins.xml'), xml, 'utf8');
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
  .then(async ({channel, versionNumber}) => {
      await readWriteTemplate("themedComponentsTemplate.xml", canaryDir, versionNumber);
      if (channel === 'all') {
        await readWriteTemplate("themedComponentsTemplate.xml", communityDir, versionNumber);
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
  })
.catch((e) => {
  console.error(e)
  readLineInterface.close()
});
