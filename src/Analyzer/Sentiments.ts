export class Sentiments {
	private static list: Sentiments.list = {
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
	constructor(private input: string) {}
	calc(): Sentiments.list {
		return { ...Sentiments.list, ...{ 'Autoconciencia Emocional': 0.1 } };
	}
}
export namespace Sentiments {
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
	export type list = { [key in sentiment]: number };
}
