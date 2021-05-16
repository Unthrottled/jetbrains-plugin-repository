import path from "path";
import fs from 'fs';
import {canaryDir, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const amiiSourceDir = path.resolve(__dirname, '..', '..', 'amii-android-extension');
const assetDirectory = path.resolve(__dirname, '..', 'amii');

startRelease(async ({channel, versionNumber}) => {
    await readWriteTemplate("amiiAndroidTemplate.xml", canaryDir, versionNumber);
    await readWriteTemplate("amiiAndroidTemplate.xml", ultimateDir, versionNumber);
    if (channel === 'all') {
      await readWriteTemplate("amiiAndroidTemplate.xml", communityDir, versionNumber);
    }
    return runCommand(amiiSourceDir, './ciScripts/buildPlugin.sh', {
      VERSION: versionNumber
    })
      .then(() => {
        fs.copyFileSync(
          path.resolve(amiiSourceDir, 'build', 'distributions', `Anime Memes - Android Extension-${versionNumber}.zip`),
          path.resolve(assetDirectory, `Anime Memes_android_extension.${versionNumber}.zip`)
        )
      });
  })
