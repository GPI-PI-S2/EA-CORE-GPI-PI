import { random } from 'ea-common-gpi-pi';
import { fromString } from 'html-to-text';
import LanguageDetect from 'languagedetect';
import { DBController } from 'src/types/DBController';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { Extractor } from '../services/Extractor';

export class Analyzer {
	private static version = '1.0';
	private static newResult(): Analyzer.sentiments {
		return {
			'Autoconciencia Emocional': random(0, 100) / 100,
			'Colaboración y Cooperación': random(0, 100) / 100,
			'Comprensión Organizativa': random(0, 100) / 100,
			'Conciencia Crítica': random(0, 100) / 100,
			'Desarrollo de las relaciones': random(0, 100) / 100,
			'Manejo de conflictos': random(0, 100) / 100,
			'Motivación de logro': random(0, 100) / 100,
			'Percepción y comprensión Emocional': random(0, 100) / 100,
			'Relación Social': random(0, 100) / 100,
			'Tolerancia a la frustración': random(0, 100) / 100,
			Asertividad: random(0, 100) / 100,
			Autoestima: random(0, 100) / 100,
			Empatía: random(0, 100) / 100,
			Influencia: random(0, 100) / 100,
			Liderazgo: random(0, 100) / 100,
			Optimismo: random(0, 100) / 100,
			Violencia: random(0, 100) / 100,
		};
	}
	static htmlParse(input: Analyzer.input): Analyzer.input {
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
	static filter(input: Analyzer.input, filters: Partial<Analyzer.Filter> = {}): boolean {
		const { empty, lang, minSentenceSize, assurance } = {
			...{ empty: false, lang: 'es', minSentenceSize: 2, assurance: 0.3 },
			...filters,
		};
		const content: string = input ? input.content : null;
		if (!empty && !content) return false;
		if (content.split(' ').length < minSentenceSize) return false;
		const lngDetector = new LanguageDetect();
		lngDetector.setLanguageType('iso2');
		const result = lngDetector.detect(content);
		const langResult = result.some((prob) => prob[0] == lang && prob[1] >= assurance);
		return langResult;
	}
	constructor(private readonly extractor: Extractor) {}
	private readonly logger = container.resolve<Logger>('logger');
	async analyze(
		input: Analyzer.input[],
		options: Analyzer.Analyze.Options,
	): Promise<Analyzer.Analysis> {
		const { metaKey } = options;
		const extractor = this.extractor.register.id;
		const isDBCAvailable = container.isRegistered<DBController>('DBController');
		const result = input.map((input) => ({
			input,
			sentiments: Analyzer.newResult(),
		}));
		const response: Analyzer.Analysis = {
			modelVersion: Analyzer.version,
			extractor,
			metaKey,
			result,
		};
		this.logger.debug(
			isDBCAvailable ? '✔️ DB controller is avaialable' : '❌ DB controller is not available',
		);
		if (isDBCAvailable) {
			const DBController = container.resolve<DBController>('DBController');
			await DBController.connect();
			await DBController.insert(response, false);
		}
		return response;
	}
}
export namespace Analyzer {
	export type sentiment =
		| 'Asertividad'
		| 'Autoconciencia Emocional'
		| 'Autoestima'
		| 'Colaboración y Cooperación'
		| 'Comprensión Organizativa'
		| 'Conciencia Crítica'
		| 'Desarrollo de las relaciones'
		| 'Empatía'
		| 'Influencia'
		| 'Liderazgo'
		| 'Manejo de conflictos'
		| 'Motivación de logro'
		| 'Optimismo'
		| 'Percepción y comprensión Emocional'
		| 'Relación Social'
		| 'Tolerancia a la frustración'
		| 'Violencia';
	export type sentiments = { [key in sentiment]: number };

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
			sentiments: sentiments;
		}[];
	}
	export namespace Analyze {
		export interface Options {
			metaKey: string;
		}
	}
}
