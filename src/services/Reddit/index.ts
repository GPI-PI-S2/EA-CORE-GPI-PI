import Axios, { AxiosInstance } from 'axios';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { Analyzer } from '../../Analyzer';
import { Extractor } from '../Extractor';
import { Response } from '../Extractor/Response';

@injectable()
export class Reddit extends Extractor {
	constructor(@inject('logger') private logger: Logger) {
		super({
			id: 'reddit-extractor', // Identificador, solo letras minúsculas y guiones (az-)
			name: 'Reddit', // Nombre legible para humanos
			version: '0.0.1',
		});
	}
	private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly
	private getComments(
		comments: Reddit.Post<Reddit.Comment>,
		counter: number,
		limit: number,
		aContent: Analyzer.input[],
	): Analyzer.input[] {
		if (!comments) return aContent;
		const childrens = comments.data.children;
		const childLength = childrens.length;
		for (let x = 0; x < childLength; x++) {
			const data = childrens[x].data;
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
	): Promise<Response<null>> {
		this.logger.verbose('DEPLOY', { config, options });
		this.api = Axios.create({
			baseURL: 'https://www.reddit.com', // Base URL,
			responseType: 'json',
		});
		return new Response(this, Response.Status.OK);
	}

	async obtain(options: Reddit.Obtain.Options): Promise<Response<Analyzer.Analysis>> {
		// oauth Reddit 0XGi1M9cPjNx1oAmjp51n0PLPlaSPg
		const { limit, minSentenceSize, subReddit, postId } = options;
		const subRedditParam = subReddit ? `/r/${subReddit}` : '';
		const metaKey = JSON.stringify({ subReddit, postId });
		this.logger.verbose('OBTAIN', { ...options, ...{ metaKey } });
		try {
			const response = await this.api.get<Reddit.Data>(
				`${subRedditParam}/comments/${postId}.json`,
				{
					params: { limit: limit, threaded: false },
				},
			);
			this.logger.debug('Request status: ', { status: response.status });
			const data = response.data;
			const comments = this.getComments(data[1], 0, limit, []);
			const filtered = comments
				.map((message) => Analyzer.htmlParse(message))
				.filter((message) =>
					Analyzer.filter(message, { minSentenceSize, assurance: 0.26 }),
				);
			//this.logger.silly('filtered:', filtered);
			this.logger.silly('length:', filtered.length);
			const analyzer = new Analyzer(this);
			const analysis = await analyzer.analyze(filtered, { metaKey });
			return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
		} catch (error) {
			this.logger.debug('OBTAIN error', error);
			return new Response<Analyzer.Analysis>(this, Response.Status.ERROR, null, error);
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
	type kind = 'Listing' | 't3' | 't2' | 't1';
	interface Structure<K extends kind, S> {
		kind: K;
		data: S;
	}
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
				children: C[];
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
