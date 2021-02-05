import fs from "fs";
import path from "path";
import crypto from "crypto";
import aws from "aws-sdk";
import {spawn} from "child_process";
import xmlParser from "xml2js";

export const rootDirectory =
  path.join(__dirname, '..');

export const assetDirectories = [
  'doki-theme-ultimate',
  'doki-theme',
  'canary',
  'ultimate',
  'themed-components',
  'one-dark',
  'waifu-motivator',
  'normandy-progress-bar',
  'amii',
  'randomizer',
];
export const canaryDir = path.resolve(__dirname, '..', 'canary');
export const ultimateDir = path.resolve(__dirname, '..', 'ultimate');
export const communityDir = path.resolve(__dirname, '..');

export async function walkDir(dir: string): Promise<string[]> {
  const values: Promise<string[]>[] = fs.readdirSync(dir)
    .map((file: string) => {
      const dirPath: string = path.join(dir, file);
      const isDirectory = fs.statSync(dirPath).isDirectory();
      if (isDirectory) {
        return walkDir(dirPath);
      } else {
        return Promise.resolve([path.join(dir, file)]);
      }
    });
  const scannedDirectories = await Promise.all(values);
  return scannedDirectories.reduce((accum, files) => accum.concat(files), []);
}

export function createChecksum(data: Buffer | string): string {
  return crypto.createHash('md5')
    .update(data)
    .digest('hex');
}

export interface StringDictionary<T> {
  [key: string]: T
}

export const BUCKET_NAME = 'jetbrains-plugin-repo';

export const buildS3Client = () => {
  aws.config.update({region: 'us-east-1'});
  return new aws.S3();
};

export const getSyncedAssets = () => JSON.parse(
  fs.readFileSync(path.join(rootDirectory, 'syncedAssets.json'), 'utf-8'));




export const runCommand = (cwd: string, command: string, env: { [key: string]: string } = {}) => {
  return new Promise((resolve) => {
    const childProcess = spawn(command, {
      cwd,
      env: {
        ...process.env,
        ...env,
      }
    });

    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);

    childProcess.on('close', () => {
      resolve();
    })
  })
};


const xmlBuilder = new xmlParser.Builder();

const toXml = (xml1: string) =>
  xmlParser.parseStringPromise(xml1)

const templateDir = path.resolve(__dirname, 'templates');
export const readWriteTemplate = async (
  versionedTemplatePath: string,
  updatePluginDirectory: string,
  pluginVersion: string
) => {
  const versionedTemplate = await toXml(fs.readFileSync(path.resolve(templateDir, versionedTemplatePath), {
    encoding: 'utf8'
  }).replace(/{{version}}/g, pluginVersion));

  const updatePluginXmlAsJson = await toXml(fs.readFileSync(path.resolve(updatePluginDirectory, 'updatePlugins.xml'), {
    encoding: 'utf8'
  }));

  updatePluginXmlAsJson.plugins.plugin = updatePluginXmlAsJson.plugins.plugin
    .filter((p: any) => p.$.id !== versionedTemplate.plugin.$.id)

  updatePluginXmlAsJson.plugins.plugin.push(versionedTemplate.plugin)

  const xml = xmlBuilder.buildObject(updatePluginXmlAsJson);
  fs.writeFileSync(path.resolve(updatePluginDirectory, 'updatePlugins.xml'), xml, 'utf8');
}
