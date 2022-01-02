import path from "path";
import fs from 'fs';
import {canaryDir, command, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const amiiSourceDir = path.resolve(__dirname, '..', '..', 'AMII');
const assetDirectory = path.resolve(__dirname, '..', 'amii');

startRelease(async ({channel, versionNumber}) => {
    await readWriteTemplate("amiiTemplate.xml", canaryDir, versionNumber);
    await readWriteTemplate("amiiTemplate.xml", ultimateDir, versionNumber);
    if (channel === 'all') {
      await readWriteTemplate("amiiTemplate.xml", communityDir, versionNumber);
    }
    return runCommand(amiiSourceDir, command, {
      VERSION: versionNumber
    })
      .then(() => {
        fs.copyFileSync(
          path.resolve(amiiSourceDir, 'build', 'distributions', `Anime Memes-${versionNumber}.zip`),
          path.resolve(assetDirectory, `Anime Memes.${versionNumber}.zip`)
        )
      });
  })
