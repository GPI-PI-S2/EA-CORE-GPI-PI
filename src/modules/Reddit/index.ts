import {Analyzer} from "@/Analyzer";
import Axios, {AxiosInstance} from "axios";
import {log} from "util";
import {Extractor} from "../Extractor";
import {Response} from "../Extractor/Response";

const flattenCommentsTree = (nodo: any): string[] => {
	if (nodo.kind === "Listing") {
		return nodo.data.children.flatMap((children: any) => flattenCommentsTree(children));
	}
	if (nodo.kind === "t1") {
		console.log(nodo.data.body);
		console.log(nodo.data.replies);
		if (nodo.data.replies.kind === "Listing") {
			let rest = flattenCommentsTree(nodo.data.replies);
			rest.unshift(nodo.data.body as string);
			return rest;
		}
		return [nodo.data.body as string];
	}
	return [];
}

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
			baseURL: "https://www.reddit.com/r/", // Base URL,
			responseType: "json",
		});
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Reddit.Obtain.Options): Promise<Response<unknown>> {
		const {limit, metaKey, minSentenceSize, subReddit, postId} = options;
		this.logger.log("Obtaining: SubReddit: ", subReddit, "Post Id: ", postId);
		const response = await this.api.get(`${subReddit}/comments/${postId}.json`);
		this.logger.log("Request status: ", response.status);
		const comments = flattenCommentsTree(response.data[1]);

		this.logger.log("Comments read: ", comments.length);
		const analyzer = new Analyzer(this);
		const message: Analyzer.input[] = comments.map(content => ({content}));
		const analysis = await analyzer.analyze(message);
		return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);

		//return new Response(this, Response.Status.OK);
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
			subReddit: String,
			postId: String,
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
