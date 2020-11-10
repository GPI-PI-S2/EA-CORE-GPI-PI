import { container } from 'tsyringe';
import { Emol } from './services/Emol';
import { Extractor } from './services/Extractor';
import { Reddit } from './services/Reddit';
import { Telegram } from './services/Telegram';
import { Twitter } from './services/Twitter';
import { Youtube } from './services/Youtube';
export const extractors: Extractor[] = [
	container.resolve(Telegram),
	container.resolve(Reddit),
	container.resolve(Emol),
	container.resolve(Twitter),
	container.resolve(Youtube),
];
