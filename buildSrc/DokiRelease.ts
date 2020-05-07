import path from "path";
import fs from 'fs';
import {readWriteTemplate, runCommand, startRelease} from "./AssetTools";

const dokiThemeRepo = path.resolve(__dirname, '..', '..', 'doki-theme-jetbrains');

const templateDir = path.resolve(__dirname, 'templates');
const canaryDir = path.resolve(__dirname, '..', 'canary');
const ultimateDir = path.resolve(__dirname, '..', 'ultimate');
const ultimateAssetsDir = path.resolve(__dirname, '..', 'doki-theme-ultimate');
const communityDir = path.resolve(__dirname, '..');
const communityAssetsDir = path.resolve(__dirname, '..', 'doki-theme');


startRelease(async ({channel, versionNumber}) => {
  await readWriteTemplate("communityUpdatePluginTemplate.xml", canaryDir, versionNumber);
  await readWriteTemplate("communityUpdatePluginTemplate.xml", ultimateDir, versionNumber);
  await readWriteTemplate("ultimateUpdatePluginTemplate.xml", canaryDir, versionNumber);
  await readWriteTemplate("ultimateUpdatePluginTemplate.xml", ultimateDir, versionNumber);
  if (channel === 'all') {
    await readWriteTemplate("communityUpdatePluginTemplate.xml", communityDir, versionNumber);
  }
  return runCommand(dokiThemeRepo, './ciScripts/preBuild.sh').then(() =>
    runCommand(dokiThemeRepo, './ciScripts/buildPlugin.sh'))
    .then(() => {
      // fs.copyFileSync(
      //   path.resolve(dokiThemeRepo, 'build', 'distributions', `doki-theme-jetbrains-${versionNumber}.zip`),
      //   path.resolve(communityAssetsDir, `doki-theme.${versionNumber}.zip`)
      // )
    }).then(()=>
      runCommand(dokiThemeRepo, './ciScripts/preBuild.sh').then(() =>
        runCommand(dokiThemeRepo, './ciScripts/buildPlugin.sh', {
          PRODUCT: 'ultimate'
        })))
    .then(()=>{
      // fs.copyFileSync(
      //   path.resolve(dokiThemeRepo, 'build', 'distributions', `doki-theme-jetbrains-${versionNumber}.zip`),
      //   path.resolve(ultimateAssetsDir, `doki-theme-ultimate.${versionNumber}.zip`)
      // )
    })
});
