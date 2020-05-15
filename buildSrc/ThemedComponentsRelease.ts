import path from "path";
import fs from 'fs';
import {canaryDir, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const themedComponentsDirectory = path.resolve(__dirname, '..', '..', 'themed-components');
const assetDirectory = path.resolve(__dirname, '..', 'themed-components');

startRelease(async ({channel, versionNumber}) => {
    await readWriteTemplate("themedComponentsTemplate.xml", canaryDir, versionNumber);
    await readWriteTemplate("themedComponentsTemplate.xml", ultimateDir, versionNumber);
    if (channel === 'all') {
      await readWriteTemplate("themedComponentsTemplate.xml", communityDir, versionNumber);
    }
    return runCommand(themedComponentsDirectory, './ciScripts/buildPlugin.sh')
      .then(() => {
        fs.copyFileSync(
          path.resolve(themedComponentsDirectory, 'build', 'distributions', `themed-components-${versionNumber}.zip`),
          path.resolve(assetDirectory, `themed-components.${versionNumber}.zip`)
        )
      });
  })
