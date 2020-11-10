import { Response } from '../../src/services/Extractor/Response';
import { Twitter } from '../../src/services/Twitter';
import logger from '../loaders/logger';
import { Readline } from '../tools/Readline';
export default async (extractor: Twitter) => {
	logger.info(`Serving extractor`);
	logger.info(`name:      ${extractor.register.name}`);
	logger.info(`version:   ${extractor.register.version}`);
	let bearerToken =
		'AAAAAAAAAAAAAAAAAAAAAJewJQEAAAAAPOlJ%2BAGXOMiIAG7dDUUtTaFAOgs%3DKLpEMQCsq33R2kwwnADok1ujE9v65o4eSf34m5b4yupPvGCi40';
	await extractor.deploy({ bearerToken });
	let hashtag = '';
	let limit = 1000;
	while (!hashtag) {
		hashtag = await Readline.read('Para buscar ingrese un término');
	}
	const result = (await extractor.obtain({ limit, metaKey: hashtag })) as Response<
		Twitter.Obtain.Response
	>;
	logger.info('response ok');
	logger.debug('result get:', result.get());
};
