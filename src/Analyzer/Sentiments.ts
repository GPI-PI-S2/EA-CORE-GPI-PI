export class Sentiments {
	private static list: Sentiments.list = {
		'autoconciencia emocional': 0,
		'autocontrol emocional': 0,
		'colaboración y cooperación': 0,
		'comprensión organizativa': 0,
		'comunicacion asertiva': 0,
		'conciencia crítica': 0,
		'desarrollar y estimular a los demás': 0,
		'desarrollo de las relaciones': 0,
		'manejo de conflictos': 0,
		'motivación de logro': 0,
		'percepción y comprensión emocional': 0,
		'relación social': 0,
		'tolerancia a la frustración': 0,
		asertividad: 0,
		autoestima: 0,
		empatía: 0,
		influencia: 0,
		liderazgo: 0,
		optimismo: 0,
		violencia: 0,
	};
	constructor(private input: string) {}
	calc(): Sentiments.list {
		return { ...Sentiments.list, ...{ 'Autoconciencia Emocional': 0.1 } };
	}
}
export namespace Sentiments {
	export type sentiment =
		| 'asertividad'
		| 'autoconciencia emocional'
		| 'autoestima'
		| 'desarrollar y estimular a los demás'
		| 'empatía'
		| 'autocontrol emocional'
		| 'influencia'
		| 'liderazgo'
		| 'optimismo'
		| 'relación social'
		| 'colaboración y cooperación'
		| 'comprensión organizativa'
		| 'conciencia crítica'
		| 'desarrollo de las relaciones'
		| 'tolerancia a la frustración'
		| 'comunicacion asertiva'
		| 'manejo de conflictos'
		| 'motivación de logro'
		| 'percepción y comprensión emocional'
		| 'violencia';
	export type list = { [key in sentiment]: number };
}
