/*
import { Analyzer } from "@/Analyzer";
import Axios, { AxiosInstance } from "axios";
*/
import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";

export class Reddit extends Extractor {
	/* 	
    private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly
	 */
	constructor() {
		super({
			id: "reddit-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Reddit", // Nombre legible para humanos
			version: "0.0.0",
		});
	}
	async deploy(config: Reddit.Deploy.Config, options: Reddit.Deploy.Options): Promise<Response<unknown>> {
		/*
		// Se crea instancia de axios con el endpoint de la api
		// https://github.com/axios/axios#axios-api
		this.api = Axios.create({
			baseURL: "https://api.test", // Base URL,
			responseType: "json",
			headers: {
				// Se añade la api key en el header (en caso de ser necesario)
				"api-key": config.apiKey,
			},
        });
        */
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Reddit.Obtain.Options): Promise<Response<unknown>> {
		const { limit, metaKey, minSentenceSize } = options;
		/*
		const analyzer = new Analyzer(this);
		// request del tipo post
		const response = await this.api.post<{ messages: string[] }>("/api/TEST", {
			postParam: 123,
			postParam2: "asd",
		});
		const message: Analyzer.input[] = response.data.messages.map((content) => ({ content }));
		const analysis = await analyzer.analyze(message);
        return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
        */
		return new Response(this, Response.Status.OK);
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