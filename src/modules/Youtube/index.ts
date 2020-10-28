import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";
const axios = require("axios");

export class Youtube extends Extractor {
	constructor() {
		super({
			id: "youtube-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Youtube", // Nombre legible para humanos
			version: "0.0.0",
		});
	}
	async deploy(config: Youtube.Deploy.Config, options: Youtube.Deploy.Options): Promise<Response> {

		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Youtube.Obtain.Options): Promise<Response> {

		let tokenPage = "";
		while (tokenPage){
			
		// obtiene toda la info de un video con el ID y una apikey 
			axios.get(`https://www.googleapis.com/youtube/v3/commentThreads?key=${options.apiKey}&textFormat=plainText&part=snippet&videoId=${options.videoID}&pageToken=${tokenPage}`)
			.then((res: any)=>{
				// +20 results?
				tokenPage = res.data.nextPageToken
				res.data.items.map((comment) => options.comments.push(comment.snippet.topLevelComment.snippet.textOriginal))
				// +20
			})
			.catch(err => {
				this.logger.error(err)
			})
		}
		return new Response(this, Response.Status.OK);
	}
	async unitaryObtain(options: Youtube.UnitaryObtain.Options): Promise<Response> {

		//get a comment by id 
		axios.get(`https://www.googleapis.com/youtube/v3/comments?part=snippet&id={COMMENT_ID}&textFormat=html&key=${options.}`)
		https://www.googleapis.com/youtube/v3/comments?part=snippet&id={COMMENT_ID}&textFormat=html&key={YOUR_API_KEY} 

		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Youtube.Destroy.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Youtube {
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {
		}
		export interface Options extends Extractor.Deploy.Options {}
		export interface Response extends Extractor.Deploy.Response {}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {
			apiKey: string;
			videoID: String;
			comments: [String];
		}
		export interface Response extends Extractor.Obtain.Response {}
	}
	export namespace UnitaryObtain {
		export interface Options extends Extractor.UnitaryObtain.Options {
			apiKey: string;
			commentID: string;
		}
		export interface Response extends Extractor.UnitaryObtain.Response {}
	}
	export namespace Destroy {
		export interface Options extends Extractor.Destroy.Options {}
		export interface Response extends Extractor.Destroy.Response {}
	}
}
