import path from "path";
import fs from 'fs';
import {canaryDir, command, communityDir, readWriteTemplate, runCommand, ultimateDir} from "./AssetTools";
import {startRelease} from "./ReleaseTools";

const dokiIconsSourceDir = path.resolve(__dirname, '..', '..', 'doki-theme-icons-jetbrains');
const assetDirectory = path.resolve(__dirname, '..', 'doki-theme-icons');

startRelease(async ({channel, versionNumber}) => {
    await readWriteTemplate("dokiIconsTemplate.xml", canaryDir, versionNumber);
    await readWriteTemplate("dokiIconsTemplate.xml", ultimateDir, versionNumber);
    if (channel === 'all') {
      await readWriteTemplate("dokiIconsTemplate.xml", communityDir, versionNumber);
    }
    return runCommand(dokiIconsSourceDir, command, {
      VERSION: versionNumber
    })
      .then(() => {
        fs.copyFileSync(
          path.resolve(dokiIconsSourceDir, 'build', 'distributions', `doki-theme-icons-jetbrains-${versionNumber}.zip`),
          path.resolve(assetDirectory, `Doki Theme Icons.${versionNumber}.zip`)
        )
      });
  })
