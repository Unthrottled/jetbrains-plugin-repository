import path from "path";
import fs from 'fs';
import {readWriteTemplate, runCommand, startRelease} from "./AssetTools";

const themedComponentsDirectory = path.resolve(__dirname, '..', '..', 'themed-components');

const canaryDir = path.resolve(__dirname, '..', 'canary');
const communityDir = path.resolve(__dirname, '..');
const communityAssetsDir = path.resolve(__dirname, '..', 'themed-components');

startRelease(async ({channel, versionNumber}) => {
    await readWriteTemplate("themedComponentsTemplate.xml", canaryDir, versionNumber);
    if (channel === 'all') {
      await readWriteTemplate("themedComponentsTemplate.xml", communityDir, versionNumber);
    }
    return runCommand(themedComponentsDirectory, './ciScripts/buildPlugin.sh')
      .then(() => {
        fs.copyFileSync(
          path.resolve(themedComponentsDirectory, 'build', 'distributions', `themed-components-${versionNumber}.zip`),
          path.resolve(communityAssetsDir, `themed-components.${versionNumber}.zip`)
        )
      });
  })
