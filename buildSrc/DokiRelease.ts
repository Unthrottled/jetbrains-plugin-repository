import readline from 'readline';
import path from "path";
import fs from 'fs';

const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

readLineInterface.on('close', () => process.exit(0))

const templateDir = path.resolve(__dirname, 'templates');
const canaryDir = path.resolve(__dirname, '..', 'canary');
const ultimateDir = path.resolve(__dirname, '..', 'ultimate');
const communityDir = path.resolve(__dirname, '..');

const readWriteTemplate = (
  template: string,
  destinationDir: string,
  version: string
) => {
  const versionedTemplate = fs.readFileSync(path.resolve(templateDir, template), {
    encoding: 'utf8'
  }).replace(/{{version}}/g, version);
  fs.writeFileSync(path.resolve(destinationDir, 'updatePlugins.xml'), versionedTemplate, 'utf8');
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
    readWriteTemplate("communityUpdatePluginTemplate.xml", canaryDir, versionNumber);
    readWriteTemplate("ultimateUpdatePluginTemplate.xml", ultimateDir, versionNumber);
    if(channel === 'all') {
      readWriteTemplate("communityUpdatePluginTemplate.xml", communityDir, versionNumber);
    }

    readLineInterface.close();
  });
