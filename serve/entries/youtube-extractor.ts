import { URL } from 'url';
import { Youtube } from '../../src/services/Youtube';
import logger from '../loaders/logger';
import { File } from '../tools/File';
import { Readline } from '../tools/Readline';

async function getVideoId(url: string) {
	const cURL = new URL(url);
	return cURL.searchParams.get('v');
}
export default async (extractor: Youtube) => {
	logger.info(`Serving extractor`);
	logger.info(`name:      ${extractor.register.name}`);
	logger.info(`version:   ${extractor.register.version}`);
	let apiKey = 'AIzaSyCbh7V9N99YuffN2s8xeu7MmfYS4l2I180';
	let urlVideo = '';
	let limit = 1000;
	if (!apiKey) apiKey = await Readline.read('Ingrese su propia api-key de YouTube (Google)');

	const deployResponse = await extractor.deploy({ apiKey });

	if (deployResponse.isError) {
		logger.error('deploy error', deployResponse.data);
		return;
	}

	if (!urlVideo) urlVideo = await Readline.read('Ingrese el url del video a analizar');
	if (limit === 0 || isNaN(limit))
		limit = Number(await Readline.read('Ingrese el límite de comentarios a analizar'));
	let videoId = await getVideoId(urlVideo);
	if (!videoId) {
		return logger.error('invalid video ID');
	}

	const result = await extractor.obtain({ metaKey: videoId, limit });
	/* 	logger.debug('result get:', result.get());
	 */

	if (result.isError) {
		logger.error('obtain error', result.data);
		return;
	}
	const file = new File('youtube.json');
	const data = result.data.result.map((content) => content.input.content);
	const total = data.length;
	await file.write({ data, total });
	logger.info('response ok');
};
