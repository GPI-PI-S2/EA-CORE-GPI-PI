import { fromString } from 'html-to-text';
import LanguageDetect from 'languagedetect';
import { DBController } from 'src/types/DBController';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { Extractor } from '../services/Extractor';
import { Sentiments } from './Sentiments';

export class Anal {
	private static version = '1.0';
	static htmlParse(input: Anal.input): Anal.input {
		let content: string = input ? input.content : null;
		if (!content) return { content };
		content = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
		content = fromString(content, {
			ignoreHref: true,
			ignoreImage: true,
			noLinkBrackets: true,
		});
		content = content
			.replace(/&quot;/g, '"')
			.replace(/\n\n/g, '\n')
			.replace(/> /g, '')
			.replace(/\n\n/g, '\n')
			.replace(/&#39;/g, '')
			.replace(/\n\n/g, '\n')
			.replace(/&#x200B;/g, '')
			.replace(/\n\n/g, '\n')
			.replace(/\n/g, ' ')
			.replace(/,,/g, ',')
			.replace(/,,/g, ',');

		return { content };
	}
	static filter(input: Anal.input, filters: Partial<Anal.Filter> = {}): boolean {
		const { empty, lang, minSentenceSize, assurance } = {
			...{ empty: false, lang: 'es', minSentenceSize: 2, assurance: 0.3 },
			...filters,
		};
		const content: string = input ? input.content : null;
		if (!empty && !content) return false;
		if (content.split(' ').length < minSentenceSize) return false;
		if (content.length > 511) return false;
		const lngDetector = new LanguageDetect();
		lngDetector.setLanguageType('iso2');
		const result = lngDetector.detect(content);
		const langResult = result.some((prob) => prob[0] == lang && prob[1] >= assurance);
		return langResult;
	}
	constructor(private readonly extractor: Extractor) {}
	private readonly logger = container.resolve<Logger>('logger');
	async analyze(input: Anal.input[], options: Anal.Analyze.Options): Promise<Anal.Analysis> {
		const { metaKey } = options;
		const extractor = this.extractor.register.id;
		const isDBCAvailable = container.isRegistered<DBController>('DBController');
		const result = input.map((input) => ({
			input,
			sentiments: new Sentiments(input.content).calc(),
		}));
		const response: Anal.Analysis = {
			modelVersion: Anal.version,
			extractor,
			metaKey,
			result,
		};
		this.logger.debug(
			isDBCAvailable ? '✔️ DB controller is avaialable' : '❌ DB controller is not available',
		);
		if (isDBCAvailable) {
			this.logger.debug('Adding to DB...');
			const DBController = container.resolve<DBController>('DBController');
			await DBController.connect();
			await DBController.insert(response, false);
			this.logger.debug('Added to DB...');
		}
		return response;
	}
}
export namespace Anal {
	export type input = {
		content: string;
	};
	export interface Filter {
		empty: boolean;
		minSentenceSize: number;
		lang: 'es';
		assurance: number;
	}
	export interface Analysis {
		extractor: string;
		metaKey: string;
		modelVersion: string;
		result: {
			input: input;
			sentiments: Sentiments.list;
		}[];
	}
	export namespace Analyze {
		export interface Options {
			metaKey: string;
		}
	}
}
