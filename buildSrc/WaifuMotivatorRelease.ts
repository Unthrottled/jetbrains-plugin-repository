import path from "path";
import fs from 'fs';
import {canaryDir, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const themedComponentsDirectory = path.resolve(__dirname, '..', '..', 'waifuMotivator','waifu-motivator-plugin');
const assetDirectory = path.resolve(__dirname, '..', 'waifu-motivator');

startRelease(async ({channel, versionNumber}) => {
    await readWriteTemplate("waifuMotivatorTemplate.xml", canaryDir, versionNumber);
    await readWriteTemplate("waifuMotivatorTemplate.xml", ultimateDir, versionNumber);
    if (channel === 'all') {
      await readWriteTemplate("waifuMotivatorTemplate.xml", communityDir, versionNumber);
    }
    return runCommand(themedComponentsDirectory, './ciScripts/buildPlugin.sh', {
      VERSION: versionNumber
    })
      .then(() => {
        fs.copyFileSync(
          path.resolve(themedComponentsDirectory, 'build', 'distributions', `waifu-motivator-plugin-${versionNumber}.zip`),
          path.resolve(assetDirectory, `waifu-motivator.${versionNumber}.zip`)
        )
      });
  })
