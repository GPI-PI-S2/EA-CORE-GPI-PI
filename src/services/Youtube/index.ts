
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
	async deploy(config: Youtube.Deploy.Config, options: Youtube.Deploy.Options): Promise<Response<unknown>> {
		
        // Se crea instancia de axios con el endpoint de la api
		// https://github.com/axios/axios#axios-api
		this.api = Axios.create({
			baseURL: "https://www.googleapis.com/youtube/v3/", // Base URL,
			responseType: "json",
			headers: {
				// // Se añade la api key en el header
				// "api-key": config.apiKey,
			},
		});
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Youtube.Obtain.Options): Promise<Response<unknown>> {

		let comments: { content: any; }[] = [];
		const analyzer = new Analyzer(this);
		/*
		    Repeticiones para mas comentarios
		*/
		let tokenPage = ''
		while (tokenPage!=undefined){
			let response = await this.api.get('commentThreads', {params:{
				key: options.apiKey,
				videoId:options.metaKey,
				part: 'Snippet',
				pageToken: tokenPage,
				maxResults: 100
			}})
			response.data.items.map((comment :any ) => {comments.push({content: comment['snippet'].topLevelComment.snippet.textOriginal})})
			tokenPage = response.data['nextPageToken']
			this.logger.log(`Comentarios actualmente escaneados: ${comments.length}`)
			if (comments.length>options.limit){
				break;
			}
		}
		const message: Analyzer.input[] = comments.map((eachComment) => ({content: eachComment.content}));
		this.logger.log(message)
		const analysis = await analyzer.analyze(message);
		return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
	}
	async unitaryObtain(options: Youtube.UnitaryObtain.Options): Promise<Response<unknown>> {

		let comments = []
		const analyzer = new Analyzer(this);
		const response = await this.api.get("comments", {params: {
			key: options.apiKey,
			id: options.metaKey,  // commentId
			part: 'snippet'
		}});
		let tokenPage = ''
		const commentOriginal = {
			content: response.data.items[0]['snippet'].textOriginal,
		}
		comments.push(commentOriginal)

		// has replies? 
		if (options.limitComment!=undefined){
			while (tokenPage!=undefined){
				let response2 = await this.api.get('comments',{params: {
					key: options.apiKey,
					parentId: options.metaKey,
					part: 'snippet',
					maxResults: 100,
					pageToken: tokenPage
				}});
				tokenPage = response.data['nextPageToken'];
				response2.data.items.map((comment: any) => comments.push({content: comment['snippet'].textOriginal}))
				this.logger.log(response2.data.items[0]['snippet'].textOriginal)
				this.logger.log(`Respuestas actualmente escaneadas: ${comments.length}`)
				if (comments.length>options.limitComment){
					break;
				}
			}
		}
		/* Parseando los datos a la estructura del analyzer */
		const message: Analyzer.input[] = comments.map((eachComment) => ({content: eachComment.content}));
		const analysis = await analyzer.analyze(message)
		this.logger.log(message)
		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Youtube.Destroy.Options): Promise<Response<unknown>> {
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
		}
		export interface Response extends Extractor.Obtain.Response {}
	}
	export namespace UnitaryObtain {
		export interface Options extends Extractor.UnitaryObtain.Options {
			apiKey: string,
			limitComment: Number;
		}
		export interface Response extends Extractor.UnitaryObtain.Response {}
	}
	export namespace Destroy {
		export interface Options extends Extractor.Destroy.Options {}
		export interface Response extends Extractor.Destroy.Response {}
	}
}
