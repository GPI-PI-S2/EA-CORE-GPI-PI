import 'reflect-metadata';
import logger from './loaders/logger';
type availables =
	| 'telegram-extractor'
	| 'youtube-extractor'
	| 'reddit-extractor'
	| 'emol-extractor';
async function main(extractor: availables) {
	await (await import('./loaders')).default();
	const extractors = await import('../src');
	const fExtractor = extractors.default.get(extractor);
	await (await import(`./entries/${extractor}`)).default(fExtractor);
	return process.exit(0);
}
try {
	main(process.env.EXTRACTOR as availables);
} catch (error) {
	logger.error('CRITICAL ERROR', error);
	process.exit(1);
}
