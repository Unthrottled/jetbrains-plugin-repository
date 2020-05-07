import readline from 'readline';
import path from "path";
import fs from 'fs';
import {spawn} from "child_process";

const dokiThemeRepo = path.resolve(__dirname, '..', '..', 'doki-theme-jetbrains');

const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const runCommand = (command: string, env: {[key: string]: string} = {} ) => {
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
const ultimateDir = path.resolve(__dirname, '..', 'ultimate');
const ultimateAssetsDir = path.resolve(__dirname, '..', 'doki-theme-ultimate');
const communityDir = path.resolve(__dirname, '..');
const communityAssetsDir = path.resolve(__dirname, '..', 'doki-theme');

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
    if (channel === 'all') {
      readWriteTemplate("communityUpdatePluginTemplate.xml", communityDir, versionNumber);
    }

    return runCommand('./ciScripts/preBuild.sh').then(() =>
      runCommand('./ciScripts/buildPlugin.sh'))
      .then(() => ({
        versionNumber
      }));
  })
  .then(({
           versionNumber
         }) => {
    fs.copyFileSync(
      path.resolve(dokiThemeRepo, 'build', 'distributions', `doki-theme-jetbrains-${versionNumber}.zip`),
      path.resolve(communityAssetsDir, `doki-theme.${versionNumber}.zip`)
    )
    return runCommand('./ciScripts/preBuild.sh').then(() =>
      runCommand('./ciScripts/buildPlugin.sh', {
        PRODUCT: 'ultimate'
      }))
      .then(() => ({
        versionNumber
      }))
  })
  .then(({
           versionNumber
         }) => {
    fs.copyFileSync(
      path.resolve(dokiThemeRepo, 'build', 'distributions', `doki-theme-jetbrains-${versionNumber}.zip`),
      path.resolve(ultimateAssetsDir, `doki-theme-ultimate.${versionNumber}.zip`)
    )

    readLineInterface.close();
  });
