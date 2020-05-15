import path from "path";
import fs from 'fs';
import {canaryDir, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const themedComponentsDirectory = path.resolve(__dirname, '..', '..', 'normandy-progress-bar');
const assetDirectory = path.resolve(__dirname, '..', 'normandy-progress-bar');

startRelease(async ({channel, versionNumber}) => {
  await readWriteTemplate("normandyProgressBarPluginTemplate.xml", canaryDir, versionNumber);
  await readWriteTemplate("normandyProgressBarPluginTemplate.xml", ultimateDir, versionNumber);
  if (channel === 'all') {
    await readWriteTemplate("normandyProgressBarPluginTemplate.xml", communityDir, versionNumber);
  }
  return runCommand(themedComponentsDirectory, './ciScripts/buildPlugin.sh')
    .then(() => {
      fs.copyFileSync(
        path.resolve(themedComponentsDirectory, 'build', 'distributions', `ssv-normandy-progress-bar-${versionNumber}.zip`),
        path.resolve(assetDirectory, `normandy-progress-bar.${versionNumber}.zip`)
      )
    });
})
