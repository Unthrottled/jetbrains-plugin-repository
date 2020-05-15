import readline from "readline";

const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

readLineInterface.on('close', () => process.exit(0))

const askQuestion = (question: string): Promise<string> =>
  new Promise<string>(resolve => readLineInterface.question(question, resolve));
export const startRelease = (chain: (p: { versionNumber: string, channel: string }) => Promise<any>) => {
  askQuestion("Which version?\n")
    .then(versionNumber => askQuestion("Which channel (canary, all)\n")
      .then(channel => ({
        versionNumber,
        channel,
      }))
    ).then(chain)
    .then(() => readLineInterface.close())
    .catch(() => readLineInterface.close());
}
