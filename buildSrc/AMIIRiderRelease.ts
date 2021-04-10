import path from "path";
import fs from 'fs';
import {canaryDir, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const amiiSourceDir = path.resolve(__dirname, '..', '..', 'AMII-rider-extensions');
const assetDirectory = path.resolve(__dirname, '..', 'amii');

startRelease(async ({channel, versionNumber}) => {
    await readWriteTemplate("amiiRiderTemplate.xml", canaryDir, versionNumber);
    await readWriteTemplate("amiiRiderTemplate.xml", ultimateDir, versionNumber);
    if (channel === 'all') {
      await readWriteTemplate("amiiTemplate.xml", communityDir, versionNumber);
    }
    return runCommand(amiiSourceDir, './ciScripts/buildPlugin.sh', {
      VERSION: versionNumber
    })
      .then(() => {
        fs.copyFileSync(
          path.resolve(amiiSourceDir, 'build', 'distributions', `Anime Memes - Rider Extension-${versionNumber}.zip`),
          path.resolve(assetDirectory, `Anime Memes_rider_extension.${versionNumber}.zip`)
        )
      });
  })
