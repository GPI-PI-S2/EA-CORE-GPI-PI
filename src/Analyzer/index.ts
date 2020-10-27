import { Extractor } from "@/modules/Extractor";

export class Analyzer {
	private static newResult(): Analyzer.sentiments {
		return {
			"Autoconciencia Emocional": 0,
			"Colaboración y Cooperación": 0,
			"Comprensión Organizativa": 0,
			"Conciencia Crítica": 0,
			"Desarrollo de las relaciones": 0,
			"Manejo de conflictos": 0,
			"Motivación de logro": 0,
			"Percepción y comprensión Emocional": 0,
			"Relación Social": 0,
			"Tolerancia a la frustración": 0,
			Asertividad: 0,
			Autoestima: 0,
			Empatía: 0,
			Influencia: 0,
			Liderazgo: 0,
			Optimismo: 0,
			Violencia: 0,
		};
	}
	constructor(private readonly extractor: Extractor) {}
	async analyze(input: Analyzer.input[]): Promise<Analyzer.Analysis> {
		const extractor = this.extractor.register.id;
		const result = input.map((input) => ({
			input,
			sentiments: Analyzer.newResult(),
		}));
		return {
			extractor,
			result,
		};
	}
}
export namespace Analyzer {
	export type sentiment =
		| "Asertividad"
		| "Autoconciencia Emocional"
		| "Autoestima"
		| "Colaboración y Cooperación"
		| "Comprensión Organizativa"
		| "Conciencia Crítica"
		| "Desarrollo de las relaciones"
		| "Empatía"
		| "Influencia"
		| "Liderazgo"
		| "Manejo de conflictos"
		| "Motivación de logro"
		| "Optimismo"
		| "Percepción y comprensión Emocional"
		| "Relación Social"
		| "Tolerancia a la frustración"
		| "Violencia";
	export type sentiments = { [key in sentiment]: number };

	export type input = {
		content: string;
	};
	export interface Analysis {
		extractor: string;
		result: {
			input: input;
			sentiments: sentiments;
		}[];
	}
}