import { Response } from '../../src/services/Extractor/Response';
import { Reddit } from '../../src/services/Reddit';
import logger from '../loaders/logger';
export default async (extractor: Reddit) => {
	logger.info(`Serving extractor`);
	logger.info(`name:      ${extractor.register.name}`);
	logger.info(`version:   ${extractor.register.version}`);
	await extractor.deploy();

	const result = (await extractor.obtain({
		postId: 'jmlgaw',
		subReddit: 'chile',
		metaKey: '',
		limit: 1000,
		minSentenceSize: 3,
	})) as Response<Reddit.Obtain.Response>;
	logger.info('response ok');
	logger.debug('result get:', result.get());
};
