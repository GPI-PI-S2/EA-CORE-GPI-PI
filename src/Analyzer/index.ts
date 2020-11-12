import { fromString } from 'html-to-text';
import LanguageDetect from 'languagedetect';
import { Extractor } from '../services/Extractor';

export class Analyzer {
	private static version = '1.0';
	private static newResult(): Analyzer.sentiments {
		return {
			'Autoconciencia Emocional': 0,
			'Colaboración y Cooperación': 0,
			'Comprensión Organizativa': 0,
			'Conciencia Crítica': 0,
			'Desarrollo de las relaciones': 0,
			'Manejo de conflictos': 0,
			'Motivación de logro': 0,
			'Percepción y comprensión Emocional': 0,
			'Relación Social': 0,
			'Tolerancia a la frustración': 0,
			Asertividad: 0,
			Autoestima: 0,
			Empatía: 0,
			Influencia: 0,
			Liderazgo: 0,
			Optimismo: 0,
			Violencia: 0,
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
	async analyze(
		input: Analyzer.input[],
		options: Analyzer.Analyze.Options,
	): Promise<Analyzer.Analysis> {
		const { metaKey } = options;
		const extractor = this.extractor.register.id;
		const result = input.map((input) => ({
			input,
			sentiments: Analyzer.newResult(),
		}));
		return {
			modelVersion: Analyzer.version,
			extractor,
			metaKey,
			result,
		};
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
