import Axios, { AxiosInstance } from 'axios';
import Joi from 'joi';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { Anal } from '../../Analyzer';
import { Extractor } from '../Extractor';
import { Response } from '../Extractor/Response';

@injectable()
export class Reddit extends Extractor {
	protected static obtainOptionsSchema = Extractor.obtainOptionsSchema.append({
		subReddit: Joi.string().required(),
		postId: Joi.string().required(),
	});
	constructor(@inject('logger') private logger: Logger) {
		super({
			id: 'reddit-extractor', // Identificador, solo letras minúsculas y guiones (az-)
			name: 'Reddit', // Nombre legible para humanos
			version: '2.0.0',
		});
	}
	private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly
	private getComments(
		comments: Reddit.Post<Reddit.Comment>,
		counter: number,
		limit: number,
		aContent: Anal.input[],
	): Anal.input[] {
		if (!comments) return aContent;
		const childrens = comments.data.children.filter((c) => c.kind === 't1');
		const childLength = childrens.length;
		for (let x = 0; x < childLength; x++) {
			const data = childrens[x].data as Reddit.Comment['data'];
			const content = data.body_html;
			const replies = data.replies;
			aContent.push({ content });
			if (aContent.length > limit || counter > limit) return aContent;
			counter++;
			if (typeof replies !== 'string') this.getComments(replies, counter, limit, aContent);
		}
		return aContent;
	}
	async deploy(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		config?: Reddit.Deploy.Config,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		options?: Reddit.Deploy.Options,
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

		this.api = Axios.create({
			baseURL: 'https://www.reddit.com', // Base URL,
			responseType: 'json',
		});
		return new Response(this, Response.Status.OK);
	}

	async obtain(options: Reddit.Obtain.Options): Promise<Response<Anal.Analysis>> {
		// oauth Reddit 0XGi1M9cPjNx1oAmjp51n0PLPlaSPg
		const { limit, minSentenceSize, subReddit, postId } = options;
		const subRedditParam = subReddit ? `/r/${subReddit}` : '';
		const metaKey = JSON.stringify({ subReddit, postId });
		this.logger.verbose(`OBTAIN ${this.register.id} v${this.register.version}`, {
			...options,
			...{ metaKey },
		});

		const validOptions = Reddit.obtainOptionsSchema.validate(options);
		if (validOptions.error)
			return new Response(this, Response.Status.ERROR, {
				optionsError: validOptions.error ? validOptions.error.message : undefined,
			} as never);

		try {
			const response = await this.api.get<Reddit.Data>(
				`${subRedditParam}/comments/${postId}.json`,
				{
					params: { limit: limit, threaded: false },
				},
			);

			const mores = response.data[1].data.children.filter(
				(child) => child.kind === 'more',
			) as Reddit.More[];
			const pageId = `t3_${postId}`;
			const pages = mores.map((child) => child.data.children).flat();
			const pagesLength = pages.length;
			this.logger.debug('Request status: ', { status: response.status });
			const data = response.data;
			const comments = this.getComments(data[1], 0, limit, []);
			let filtered = comments
				.map((message) => Anal.htmlParse(message))
				.filter((message) => Anal.filter(message, { minSentenceSize, assurance: 0.2 }));
			for (let x = 0; pagesLength > 0 && x <= pagesLength && filtered.length < limit; x++) {
				try {
					const response = await this.api.get<Reddit.CommentsMoreChildren>(
						`/api/morechildren.json`,
						{
							params: { api_type: 'json', link_id: pageId, children: pages[x] },
						},
					);
					if (!response.data || !response.data.json.data) break;
					const lComments = response.data.json.data.things;
					const lFiltered = (lComments.map((c) => ({
						content: c.data.body_html,
					})) as Anal.input[])
						.map((message) => Anal.htmlParse(message))
						.filter((message) =>
							Anal.filter(message, { minSentenceSize, assurance: 0.2 }),
						);
					filtered = filtered.concat(lFiltered);
					this.logger.info(`Comentarios actualmente escaneados: ${filtered.length}`);
				} catch (error) {
					this.logger.error(error);
				}
			}
			filtered = filtered.slice(0, limit);
			this.logger.silly(`length: ${filtered.length}`);
			const anal = new Anal(this);
			const analysis = await anal.analyze(filtered, { metaKey });
			return new Response<Anal.Analysis>(this, Response.Status.OK, analysis);
		} catch (error) {
			this.logger.debug(`OBTAIN error ${this.register.id} v${this.register.version}`, error);
			return new Response<Anal.Analysis>(this, Response.Status.ERROR, null, error);
		}
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async unitaryObtain(options: Reddit.UnitaryObtain.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async destroy(options: Reddit.Destroy.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Reddit {
	type kind = 'Listing' | 't3' | 't2' | 't1' | 'more';
	interface Structure<K extends kind, S> {
		kind: K;
		data: S;
	}
	interface MoreChildren<T extends Comment | Header> {
		json: {
			errors: unknown[];
			data: {
				things: T[];
			};
		};
	}
	export interface CommentsMoreChildren extends MoreChildren<Comment> {}
	export interface More
		extends Structure<
			'more',
			{
				count: number;
				name: string;
				id: string;
				parent_id: string;
				depth: number;
				children: string[];
			}
		> {}
	export interface Header
		extends Structure<
			't3',
			{
				subreddit: string;
				selftext: string;
				selftext_html: string;
				title: string;
				subreddit_name_prefixed: string;
				name: string;
				author_fullname: string;
			}
		> {}
	export interface Comment
		extends Structure<
			't1',
			{
				total_awards_received: number;
				link_id: string;
				body: string;
				body_html: string;
				permalink: string;
				name: string;
				author_fullname: string;
				controversiality: number;
				replies: '' | Post<Comment>;
			}
		> {}
	export interface Post<C extends Comment | Header>
		extends Structure<
			'Listing',
			{
				modhash: string;
				dist: number;
				children: (C extends Header ? Header : Comment | More)[];
				after: unknown;
				before: unknown;
			}
		> {}
	export type Data = [Post<Header>, Post<Comment>];
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {}
		export interface Options extends Extractor.Deploy.Options {}
		export interface Response extends Extractor.Deploy.Response {}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {
			subReddit: string;
			postId: string;
		}
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
