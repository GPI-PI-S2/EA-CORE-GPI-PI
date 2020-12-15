import { Reddit } from '../../src/services/Reddit';
import logger from '../loaders/logger';

export default async (extractor: Reddit) => {
	logger.info(`Serving extractor`);
	logger.info(`name:      ${extractor.register.name}`);
	logger.info(`version:   ${extractor.register.version}`);
	await extractor.deploy();

	const result = await extractor.obtain({
		postId: 'kd05iq',
		subReddit: 'chile',
		metaKey: 'jmlgaw',
		limit: 1000,
		minSentenceSize: 3,
	});
	//logger.debug('result get:', result.get());
	if (result.isError) {
		logger.error('obtain error', result.data);
		return;
	}
	const data = result.data.result.map((content) => content.input.content);
	const total = data.length;
	/* const file = new File('reddit.json');
	await file.write(result.data.result as any); */
	logger.info('response ok');
};
