import { container } from 'tsyringe';
import { Extractor } from './services/Extractor';
import { Reddit } from './services/Reddit';
import { Telegram } from './services/Telegram';
import { Twitter } from './services/Twitter';
import { Youtube } from './services/Youtube';
export const extractors: Extractor[] = [
	//Container.get(Telegram),
	//Container.get(Emol),
	container.resolve(Telegram),
	new Reddit(),
	new Twitter(),
	new Youtube(),
];
