const fsPromises = require('fs').promises;
const path = require('path');
const cliProgress = require('cli-progress');
const exec = require('child_process').exec;

const tickersDir = path.resolve(__dirname, 'tickers');
const scriptDir = path.resolve(__dirname, 'script/bulkSync.sh');
const errorsDir = path.resolve(__dirname, 'errors-tickers.log');

const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const markets = ['AMEX', 'NASDAQ', 'NYSE'];

async function parseTickers(market) {
  const data = await fsPromises.readFile(path.join(tickersDir, `${market}.txt`), 'utf8');
  const lines = data.split('\n');
  const tickers = lines
    .map((line) => line.split('\t')[0])
    .filter((ticker) => !ticker.includes('.'));
  return tickers;
}

async function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(stderr);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function bulkSync() {
  const tickersGroup = await Promise.all(markets.map(parseTickers));
  const tickers = [].concat(...tickersGroup);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(tickers.length, 0);
  const errorTickers = [];
  for (let i = 0; i < tickers.length; i += 1) {
    try {
      console.log(`${scriptDir} ${tickers[i]}`);
      await execCommand(`${scriptDir} ${tickers[i]}`);
    } catch (e) {
      fsPromises.appendFile(errorsDir, `${tickers[i]}\n`, 'utf8');
    }

    await sleep(3000);
    bar.update(i + 1);
  }
}

bulkSync();
