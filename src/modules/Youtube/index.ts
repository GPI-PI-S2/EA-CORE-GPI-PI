
import { Analyzer } from "@/Analyzer";
import Axios, { AxiosInstance } from "axios";
import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";

export class Youtube extends Extractor {
	private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly
	constructor() {
		super({
			id: "youtube-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Youtube", // Nombre legible para humanos
			version: "0.0.0",
		});
	}
	async deploy(config: Youtube.Deploy.Config, options: Youtube.Deploy.Options): Promise<Response> {
		this.api = Axios.create({
			baseURL: "https://www.googleapis.com/youtube/v3/", // Base URL,
			responseType: "json",
			headers: {
				// Se añade la api key en el header
				"api-key": config.apiKey,
			},
		});
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Youtube.Obtain.Options): Promise<Response> {

		// let tokenPage = "";
		// while (tokenPage){
			
		// // obtiene toda la info de un video con el ID y una apikey 
		// 	axios.get(`https://www.googleapis.com/youtube/v3/commentThreads?key=${options.apiKey}&textFormat=plainText&part=snippet&videoId=${options.videoID}&pageToken=${tokenPage}`)
		// 	.then((res: any)=>{
		// 		// +20 results?
		// 		tokenPage = res.data.nextPageToken
		// 		res.data.items.map((comment) => options.comments.push(comment.snippet.topLevelComment.snippet.textOriginal))
		// 		// +20
		// 	})
		// 	.catch(err => {
		// 		this.logger.error(err)
		// 	})
		// }

        // Se crea instancia de axios con el endpoint de la api
		// https://github.com/axios/axios#axios-api

        const analyzer = new Analyzer(this);
		const response = await this.api.get<{ ytData: JSON }>("/commentThreads", {params: {
			key: options.apiKey,
			videoId: options.metaKey,
			part: options.part
		}});
		if (options.part=='snippet'){
			const message: Analyzer.input[] = response.data.ytData.items.map((comment : JSON) => ({ content: comment.snippet.topLevelComment.snippet.textOriginal}));
		} // else if (options=='snippet,replies'){
			//
		//}
		const analysis = await analyzer.analyze(message);

		return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
	}
	async unitaryObtain(options: Youtube.UnitaryObtain.Options): Promise<Response> {

		//get a comment by id 
		// axios.get(`https://www.googleapis.com/youtube/v3/comments?part=snippet&id={COMMENT_ID}&textFormat=html&key=${options.}`)
		// https://www.googleapis.com/youtube/v3/comments?part=snippet&id={COMMENT_ID}&textFormat=html&key={YOUR_API_KEY} 
		const analyzer = new Analyzer(this);

		const response = await this.api.get<{ ytData: JSON }>("/comments", {params: {
			key: options.apiKey,
			id: options.metaKey,  // commentId
			part: options.part,
		}});
		
		const analysis = await analyzer.analyze(message)
		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Youtube.Destroy.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Youtube {
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {
            apiKey: string;
		}
		export interface Options extends Extractor.Deploy.Options {}
		export interface Response extends Extractor.Deploy.Response {}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {
			apiKey: string;
			comments: [String];
			// snippet para top level comentario, "snippet,replies" para top level comentarios y respuestas de los comentarios
			part: String;
		}
		export interface Response extends Extractor.Obtain.Response {}
	}
	export namespace UnitaryObtain {
		export interface Options extends Extractor.UnitaryObtain.Options {
			apiKey: string;
			part: String;
		}
		export interface Response extends Extractor.UnitaryObtain.Response {}
	}
	export namespace Destroy {
		export interface Options extends Extractor.Destroy.Options {}
		export interface Response extends Extractor.Destroy.Response {}
	}
}
