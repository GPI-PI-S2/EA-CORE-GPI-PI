import { AxiosInstance, default as Axios } from 'axios';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { Analyzer } from '../../Analyzer';
import { Extractor } from '../Extractor';
import { Response } from '../Extractor/Response';

@injectable()
export class Emol extends Extractor {
	private static baseParams = {
		action: 'getComments',
		rootComment: false,
		order: 'TIME',
		format: 'json',
		includePending: false,
	};

	constructor(@inject('logger') private logger: Logger) {
		super({
			id: 'emol-extractor', // Identificador, solo letras minúsculas y guiones (az-)
			name: 'Emol', // Nombre legible para humanos
			version: '1.0.0',
		});
	}
	private api: AxiosInstance;

	async deploy(
		config: Emol.Deploy.Config = {},
		options: Emol.Deploy.Options = {},
	): Promise<Response<unknown>> {
		this.logger.verbose(`DEPLOY ${this.register.id} v${this.register.version}`, {
			config,
			options,
		});

		const validConfig = Extractor.deployConfigSchema.validate(config);
		const validOptions = Extractor.deployOptionsSchema.validate(options);
		if (validConfig.error || validOptions.error)
			return new Response(this, Response.Status.ERROR, {
				configError: validConfig.error ? validConfig.error.message : undefined,
				optionsError: validOptions.error ? validOptions.error.message : undefined,
			});

		// https://github.com/axios/axios#axios-api
		this.api = Axios.create({
			baseURL: 'https://cache-comentarios.ecn.cl/Comments/Api',
			responseType: 'json',
			params: Emol.baseParams,
		});

		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Emol.Obtain.Options): Promise<Response<Analyzer.Analysis>> {
		this.logger.verbose(`OBTAIN ${this.register.id} v${this.register.version}`, options);
		const validOptions = Extractor.obtainOptionsSchema.validate(options);
		if (validOptions.error)
			return new Response(this, Response.Status.ERROR, {
				optionsError: validOptions.error ? validOptions.error.message : undefined,
			} as never);

		const { metaKey: url, limit, minSentenceSize } = options;
		const analyzer = new Analyzer(this);
		try {
			const response = await this.api.get<Emol.Api.Data>('', {
				params: {
					url,
					limit,
				},
			});
			const comments: Analyzer.input[] = response.data.comments
				.filter((comment, index) => index < limit && comment.text !== '  ')
				.map((comment) => {
					const pComment = comment.text.replace(/(@.*\[\d*\]( )?)|&nbsp;*/g, '');
					return { content: pComment };
				});
			// Hay que normalizar lo más posible los comentarios o no pasarán el filtro del Analyzer
			const filtered = comments
				.map((comment) => Analyzer.htmlParse(comment))
				.filter((comment) => Analyzer.filter(comment, { minSentenceSize, assurance: 0.2 }));

			this.logger.silly(`length: ${filtered.length}`);
			const analysis = await analyzer.analyze(filtered, { metaKey: url });
			return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
		} catch (error) {
			this.logger.silly('OBTAIN error', error);
			return new Response(this, Response.Status.ERROR, null, error);
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
