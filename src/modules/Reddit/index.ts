import {Analyzer} from "@/Analyzer";
import Axios, {AxiosInstance} from "axios";
import {log} from "util";
import {Extractor} from "../Extractor";
import {Response} from "../Extractor/Response";

export class Reddit extends Extractor {
	private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly
	constructor() {
		super({
			id: "reddit-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Reddit", // Nombre legible para humanos
			version: "0.0.1",
		});
	}
	async deploy(config: Reddit.Deploy.Config, options: Reddit.Deploy.Options): Promise<Response<unknown>> {
		this.api = Axios.create({
			baseURL: "https://www.reddit.com", // Base URL,
			responseType: "json",
		});
		return new Response(this, Response.Status.OK);
	}

	private getCommentsList(commentsData: any): string[] {
		return commentsData.map((commentData: any) => commentData.data.body)
	}

	async obtain(options: Reddit.Obtain.Options): Promise<Response<unknown>> {
		// oauth Reddit 0XGi1M9cPjNx1oAmjp51n0PLPlaSPg
		const {limit, minSentenceSize, subReddit, postId} = options;
		const subRedditParam = subReddit ? `/r/${subReddit}` : '';
		this.logger.log("Obtaining: SubReddit: ", subReddit, ", Post Id: ", postId);
		try {
			const response = await this.api.get(`${subRedditParam}/comments/${postId}.json`, {params: {limit: limit, threaded: false}});
			this.logger.log("Request status: ", response.status);
			const comments = this.getCommentsList(response.data[1].data.children);
			const analyzer = new Analyzer(this);
			const messages: Analyzer.input[] = comments.map(content => ({content}));
			const filteredMessages = messages.filter(message => Analyzer.filter(message, {minSentenceSize}));
			this.logger.log("Valid messages: ", filteredMessages.length);
			const analysis = await analyzer.analyze(filteredMessages);
			return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
		}
		catch (error) {
			this.logger.error(error.response);
			return new Response<Analyzer.Analysis>(this, Response.Status.ERROR);
		}

	}
	async unitaryObtain(options: Reddit.UnitaryObtain.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Reddit.Destroy.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Reddit {
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {
			/*
						apiKey: string;
						*/
		}
		export interface Options extends Extractor.Deploy.Options {}
		export interface Response extends Extractor.Deploy.Response {}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {
			subReddit: string,
			postId: string,
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
