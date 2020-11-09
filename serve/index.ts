import 'reflect-metadata';
import logger from './loaders/logger';

async function main(extractor: string) {
	await (await import('./loaders')).default();
	const { extractors } = await import('../src');
	const fExtractor = extractors.find((e) => e.register.id === 'telegram-extractor');
	await (await import(`./entries/${extractor}`)).default(fExtractor);
	return process.exit(0);
}
try {
	main(process.env.EXTRACTOR);
} catch (error) {
	logger.error('CRITICAL ERROR', error);
	process.exit(1);
}
