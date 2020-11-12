import { container } from 'tsyringe';
import { Emol } from './services/Emol';
import { Extractor } from './services/Extractor';
import { Reddit } from './services/Reddit';
import { Telegram } from './services/Telegram';
import { Twitter } from './services/Twitter';
import { Youtube } from './services/Youtube';
export * from './Analyzer';
export * from './types/DBController';
class extractors {
	private static extractors: Extractor[] = [
		container.resolve(Telegram),
		container.resolve(Reddit),
		container.resolve(Emol),
		container.resolve(Twitter),
		container.resolve(Youtube),
	];
	public static get availables(): Extractor.Register[] {
		return this.extractors.map((e) => e.register);
	}
	public static get<T extends Extractors.availables>(type: T): Extractors.get<T> {
		return this.extractors.find((e) => e.register.id === type) as never;
	}
}
namespace Extractors {
	export declare class extractors {
		availables: Extractor.Register[];
		get<T extends Extractors.availables>(type: T): Extractors.get<T>;
	}
	export type availables =
		| 'telegram-extractor'
		| 'youtube-extractor'
		| 'reddit-extractor'
		| 'emol-extractor';
	export type get<T extends availables> = T extends 'telegram-extractor'
		? Telegram
		: T extends 'youtube-extractor'
		? Youtube
		: T extends 'reddit-extractor'
		? Reddit
		: T extends 'emol-extractor'
		? Emol
		: never;
}
export default (extractors as unknown) as Extractors.extractors;
