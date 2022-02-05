import path from "path";
import fs from 'fs';
import {canaryDir, command, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const amiiSourceDir = path.resolve(__dirname, '..', '..', 'theme-randomizer');
const assetDirectory = path.resolve(__dirname, '..', 'randomizer');

startRelease(async ({channel, versionNumber}) => {
    await readWriteTemplate("randomizerTemplate.xml", canaryDir, versionNumber);
    await readWriteTemplate("randomizerTemplate.xml", ultimateDir, versionNumber);
    if (channel === 'all') {
      await readWriteTemplate("randomizerTemplate.xml", communityDir, versionNumber);
    }
    return runCommand(amiiSourceDir, command, {
      VERSION: versionNumber
    })
      .then(() => {
        fs.copyFileSync(
          path.resolve(amiiSourceDir, 'build', 'distributions', `theme-randomizer-${versionNumber}.zip`),
          path.resolve(assetDirectory, `theme-randomizer.${versionNumber}.zip`)
        )
      });
  })
