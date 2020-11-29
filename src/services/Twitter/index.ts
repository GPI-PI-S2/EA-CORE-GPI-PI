import Axios, { AxiosInstance } from 'axios';
import Joi from 'joi';
import { inject, injectable } from 'tsyringe';
import tweetParser from 'tweet-parser';
import { Logger } from 'winston';
import { Analyzer } from '../../Analyzer';
import { Extractor } from '../Extractor';
import { Response } from '../Extractor/Response';

@injectable()
export class Twitter extends Extractor {
	private static tweetParse(tweet: Twitter.Tweet, hashtags = false): string {
		const parsed = tweetParser(tweet.text);
		let stringParsed = parsed
			.map((entity) => {
				if (entity.type === 'TEXT' && entity.content != ' ' && entity.content !== '')
					return entity.content;
				else if (hashtags && entity.type === 'HASH') return entity.content;
				else if (entity.type === 'HASH') {
					return entity.content.replace('#', '') + ' ';
				} else return '';
			})
			.join('');
		if (hashtags) {
			stringParsed = stringParsed.split('#').join(' #');
		}
		stringParsed = stringParsed
			.replace(/RT : /g, '')
			.replace(/\n\n/g, '\n')
			.replace(/ {2}/g, ' ')
			.replace(/\n\n/g, '\n')
			.replace(/ {2}/g, ' ')
			.replace(/ {1}\n/g, '\n');

		if (stringParsed.startsWith(' ')) stringParsed = stringParsed.slice(1);
		if (stringParsed.endsWith(' ')) stringParsed = stringParsed.slice(0, -1);
		return stringParsed;
	}
	protected static deployConfigSchema = Extractor.deployConfigSchema.append({
		bearerToken: Joi.string().required(),
	});
	constructor(@inject('logger') private logger: Logger) {
		super({
			id: 'twitter-extractor', // Identificador, solo letras minúsculas y guiones (az-)
			name: 'Twitter', // Nombre legible para humanos
			version: '1.0.0',
		});
	}
	private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async deploy(
		config: Twitter.Deploy.Config,
		options?: Twitter.Deploy.Options,
	): Promise<Response<null>> {
		this.logger.verbose(`DEPLOY ${this.register.id} v${this.register.version}`, {
			config,
			options,
		});

		const validConfig = Twitter.deployConfigSchema.validate(config);
		const validOptions = Twitter.deployOptionsSchema.validate(options);
		if (validConfig.error || validOptions.error)
			return new Response(this, Response.Status.ERROR, {
				configError: validConfig.error ? validConfig.error.message : undefined,
				optionsError: validOptions.error ? validOptions.error.message : undefined,
			} as never);

		const { bearerToken } = config;
		this.api = Axios.create({
			baseURL: 'https://api.twitter.com/2/tweets',
			responseType: 'json',
			headers: {
				Authorization: 'Bearer ' + bearerToken,
			},
		});
		return new Response(this, Response.Status.OK);
	}

	/**
	 * Función para obtener una lista de Tweets, el limite máximo de tweets es de 100
	 *
	 * @param {Twitter.Obtain.Options} options
	 * @returns {Promise<Response<unknown>>}
	 * @memberof Twitter
	 */
	async obtain(options: Twitter.Obtain.Options): Promise<Response<Analyzer.Analysis>> {
		this.logger.verbose(`OBTAIN ${this.register.id} v${this.register.version}`, options);
		const validOptions = Twitter.obtainOptionsSchema.validate(options);
		if (validOptions.error)
			return new Response(this, Response.Status.ERROR, {
				optionsError: validOptions.error ? validOptions.error.message : undefined,
			} as never);

		const { limit, metaKey, minSentenceSize } = options;
		let filtered: Analyzer.input[] = [];
		let tokenPage = '';
		try {
			while (tokenPage != undefined) {
				const response = await this.api.get<Twitter.RecentSearch>('/search/recent', {
					params: {
						max_results: limit > 100 ? 100 : limit,
						query: metaKey,
						next_token: tokenPage ? tokenPage : undefined,
					},
				});
				const tweets = response.data.data;
				filtered = filtered
					.concat(tweets.map((tweet) => ({ content: Twitter.tweetParse(tweet) })))
					.filter((content) => Analyzer.filter(content, { minSentenceSize }));
				tokenPage = response.data.meta.next_token;
				this.logger.debug(`Tweets actualmente escaneados: ${filtered.length}`);
				if (filtered.length > limit) {
					break;
				}
			}
			const resultLength = filtered.length;
			if (resultLength > limit) filtered = filtered.slice(resultLength - limit);
			this.logger.silly('filtered:', filtered);
			this.logger.silly('length:', filtered.length);
			const analyzer = new Analyzer(this);
			const analysis = await analyzer.analyze(filtered, { metaKey });
			return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
		} catch (error) {
			this.logger.debug(`OBTAIN error ${this.register.id} v${this.register.version}`, error);
			return new Response<Analyzer.Analysis>(this, Response.Status.ERROR, null, error);
		}
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async unitaryObtain(options: Twitter.UnitaryObtain.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async destroy(options: Twitter.Destroy.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Twitter {
	export interface Tweet {
		id: string;
		lang?: string;
		text: string;
		created_at?: string;
		conversation_id?: string;
	}
	export interface Search<K extends unknown> {
		data: K[];
		meta: {
			newest_id: string;
			oldest_id: string;
			result_count: number;
			next_token: string;
		};
	}
	export interface RecentSearch extends Search<Tweet> {}
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {
			bearerToken: string;
		}
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
