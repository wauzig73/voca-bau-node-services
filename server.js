/**
 * Cron server for workers
 */

const fs = require('fs');
const path = require('path');
const Configstore = require('configstore');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const Graceful = require('@ladjs/graceful');
const Bree = require('bree');

const dir = path.dirname(fs.realpathSync(__filename));
process.chdir(dir); // otherwise node-services/deamon-folder will be created in current directory!

const config = new Configstore('voca-bau-node-services');
if (!config.get('server')) {
  return;
}

const { combine, timestamp, label, printf } = format;
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});
const logger = createLogger({
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.DailyRotateFile(config.get('server.logger'))
  ]
});

const bree = new Bree({
  logger: logger,
  jobs: config.get('server.jobs')
});

const graceful = new Graceful({ brees: [bree] });
graceful.listen();

bree.start();