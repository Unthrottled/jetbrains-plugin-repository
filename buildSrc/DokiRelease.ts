import path from "path";
import fs from 'fs';
import {canaryDir, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const dokiThemeRepo = path.resolve(__dirname, '..', '..', 'doki-theme-jetbrains');
const ultimateAssetsDir = path.resolve(__dirname, '..', 'doki-theme-ultimate');
const communityAssetsDir = path.resolve(__dirname, '..', 'doki-theme');

startRelease(async ({channel, versionNumber}) => {
  await readWriteTemplate("communityUpdatePluginTemplate.xml", canaryDir, versionNumber);
  await readWriteTemplate("communityUpdatePluginTemplate.xml", ultimateDir, versionNumber);
  await readWriteTemplate("ultimateUpdatePluginTemplate.xml", ultimateDir, versionNumber);
  if (channel === 'all') {
    await readWriteTemplate("communityUpdatePluginTemplate.xml", communityDir, versionNumber);
  }
  return runCommand(dokiThemeRepo, './ciScripts/buildPlugin.sh')
    .then(() => {
      fs.copyFileSync(
        path.resolve(dokiThemeRepo, 'build', 'distributions', `doki-theme-jetbrains-${versionNumber}.zip`),
        path.resolve(communityAssetsDir, `doki-theme.${versionNumber}.zip`)
      )
    }).then(()=>
        runCommand(dokiThemeRepo, './ciScripts/buildPlugin.sh', {
          PRODUCT: 'ultimate'
        }))
    .then(()=>{
      fs.copyFileSync(
        path.resolve(dokiThemeRepo, 'build', 'distributions', `doki-theme-jetbrains-${versionNumber}.zip`),
        path.resolve(ultimateAssetsDir, `doki-theme-ultimate.${versionNumber}.zip`)
      )
    })
});
