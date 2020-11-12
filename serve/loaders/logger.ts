import { config, createLogger, format, transports } from 'winston';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import prismjs from './prismjs';
const { combine, json, splat, cli, printf } = format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
	let msg = `${level}: ${message} `;
	const splat = (Reflect.ownKeys(metadata).find(
		(key) => String(key) === 'Symbol(splat)',
	) as unknown) as string;
	if (splat) {
		const delimiter = '--------⬆️';
		console.log(msg);
		Object.values({ ...metadata[splat] }).forEach((value) => {
			const r = prismjs(JSON.stringify(value, null, 2));
			console.log(r);
		});
		return delimiter;
	} else return msg;
});
const cTransports: ConsoleTransportInstance[] = [];
cTransports.push(
	new transports.Console({
		format: combine(),
	}),
);
const LoggerInstance = createLogger({
	level: process.env.LEVEL,
	levels: config.npm.levels,
	format: combine(format.colorize(), splat(), json(), cli(), myFormat),
	transports: cTransports,
});

export default LoggerInstance;
