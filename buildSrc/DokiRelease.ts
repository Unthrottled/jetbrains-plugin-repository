import path from "path";
import fs from 'fs';
import {runCommand, startRelease} from "./AssetTools";

const dokiThemeRepo = path.resolve(__dirname, '..', '..', 'doki-theme-jetbrains');

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

startRelease(({channel, versionNumber}) => {
  readWriteTemplate("communityUpdatePluginTemplate.xml", canaryDir, versionNumber);
  readWriteTemplate("ultimateUpdatePluginTemplate.xml", ultimateDir, versionNumber);
  if (channel === 'all') {
    readWriteTemplate("communityUpdatePluginTemplate.xml", communityDir, versionNumber);
  }

  return runCommand(dokiThemeRepo, './ciScripts/preBuild.sh').then(() =>
    runCommand(dokiThemeRepo, './ciScripts/buildPlugin.sh'))
    .then(() => {
      fs.copyFileSync(
        path.resolve(dokiThemeRepo, 'build', 'distributions', `doki-theme-jetbrains-${versionNumber}.zip`),
        path.resolve(communityAssetsDir, `doki-theme.${versionNumber}.zip`)
      )
      return runCommand(dokiThemeRepo, './ciScripts/preBuild.sh').then(() =>
        runCommand(dokiThemeRepo, './ciScripts/buildPlugin.sh', {
          PRODUCT: 'ultimate'
        }))
        .then(() => {
          fs.copyFileSync(
            path.resolve(dokiThemeRepo, 'build', 'distributions', `doki-theme-jetbrains-${versionNumber}.zip`),
            path.resolve(ultimateAssetsDir, `doki-theme-ultimate.${versionNumber}.zip`)
          )
        })
    })
});
