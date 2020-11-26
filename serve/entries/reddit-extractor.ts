import { Reddit } from '../../src/services/Reddit';
import logger from '../loaders/logger';
import { File } from '../tools/File';

export default async (extractor: Reddit) => {
	logger.info(`Serving extractor`);
	logger.info(`name:      ${extractor.register.name}`);
	logger.info(`version:   ${extractor.register.version}`);
	await extractor.deploy();

	const result = await extractor.obtain({
		postId: 'jmlgaw',
		subReddit: 'chile',
		metaKey: '',
		limit: 1000,
		minSentenceSize: 3,
	});
	/* 	logger.debug('result get:', result.get());
	 */ const file = new File('reddit.json');
	const data = result.data.result.map((content) => content.input.content);
	const total = data.length;
	await file.write({ data, total });
	logger.info('response ok');
};
