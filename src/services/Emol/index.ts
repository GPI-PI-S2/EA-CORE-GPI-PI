import { Analyzer } from '@/Analyzer';
import { AxiosInstance, default as Axios } from 'axios';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { Extractor } from '../Extractor';
import { Response } from '../Extractor/Response';
@Service()
export class Emol extends Extractor {
	static baseParams = {
		action: 'getComments',
		rootComment: false,
		order: 'TIME',
		format: 'json',
		includePending: false,
	};
	private api: AxiosInstance;
	constructor(@Inject('logger') private logger: Logger) {
		super({
			id: 'emol-extractor', // Identificador, solo letras minúsculas y guiones (az-)
			name: 'Emol', // Nombre legible para humanos
			version: '0.0.0',
		});
	}
	async deploy(
		config: Emol.Deploy.Config = {},
		options: Emol.Deploy.Options = {},
	): Promise<Response<unknown>> {
		this.logger.debug('DEPLOY', { config, options });
		// https://github.com/axios/axios#axios-api
		this.api = Axios.create({
			baseURL: 'https://cache-comentarios.ecn.cl/Comments/Api',
			responseType: 'json',
			params: Emol.baseParams,
		});

		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Emol.Obtain.Options): Promise<Response<unknown>> {
		this.logger.debug('OBTAIN', { options });
		const { metaKey: url, limit, minSentenceSize } = options;
		const analyzer = new Analyzer(this);
		try {
			/*
			 * Tener encuenta que limit para emol son solamente los comentarios padres
			 * Las respuestas a estos igual se considerarán (las que empiezan
			 * con referencia al autor del comentario padre).
			 * Por lo que la cantidad de comentarios a obtener será potencialmente superior
			 * al límite deseado,
			 * considerar.
			 */
			const response = (await this.api.get('', {
				params: {
					url,
					limit,
				},
			})) as Emol.Api.Response;
			const comments: Analyzer.input[] = response.data.comments
				.filter((comment) => comment.text !== '  ')
				.map((comment) => {
					/**
					 * TODO: NORMALIZAR CORRECTAMENTE LOS COMENTARIOS
					 * *Hay comentarios que son fotos, esos se eliminan
					 * Actualmente elimina las referencias a usuarios y &nbsp
					 * pero faltan los tags html entre otros (Ojo que reemplazarlos todos por ""
					 * puede resultar en palabras juntas del tipo HolaComoEstas).
					 * Recomiendo intentar con expresiones regulares,
					 * en esta página se pueden testear https://regex101.com/
					 */
					const pComment = comment.text.replace(/(@.*\[\d*\]( )?)|&nbsp;*/g, '');
					return { content: pComment };
				});
			this.logger.silly(comments);
			// Hay que normalizar lo más posible los comentarios o no pasarán el filtro del Analyzer
			const filtered = comments.filter((comment) =>
				Analyzer.filter(comment, { minSentenceSize }),
			);
			const analysis = await analyzer.analyze(filtered);
			return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
		} catch (error) {
			return new Response(this, Response.Status.ERROR, error);
		}
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async unitaryObtain(_options: Emol.UnitaryObtain.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async destroy(_options: Emol.Destroy.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Emol {
	export namespace Api {
		export interface Comment {
			id: number;
			creator: string;
			presence: string;
			promotedCreator: boolean;
			disabledCreator: boolean;
			creatorId: number;
			parentId: number;
			banned: boolean;
			authSource: string;
			validated: boolean;
			location: string;
			text: string;
			likes: number;
			dislikes: number;
			denounces: number;
			time: number;
			status: string;
			boost: number;
			highlight: boolean;
			level: number;
			pageSection: string;
			anchor: string;
			pageCmsId: number;
		}
		export interface Data {
			time: number;
			commentsCounter: number;
			userBusiness: boolean;
			userValidated: boolean;
			userPromoted: boolean;
			userTotalFollowers: number;
			userTotalFollowing: number;
			comments: Comment[];
		}
		export interface Response {
			data: Data;
		}
	}
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {}
		export interface Options extends Extractor.Deploy.Options {}
		export interface Response extends Extractor.Deploy.Response {}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {}
		export interface Response extends Extractor.Obtain.Response {}
	}
	export namespace UnitaryObtain {
		export interface Options extends Extractor.UnitaryObtain.Options {}
		export interface Response extends Extractor.UnitaryObtain.Response {}
	}
	export namespace Destroy {
		export interface Options extends Extractor.Destroy.Options {}
		export interface Response extends Extractor.Destroy.Response {}
	}
}
