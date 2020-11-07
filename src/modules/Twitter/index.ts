
import { Analyzer } from "@/Analyzer";
import Axios, { AxiosInstance } from "axios";
import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";

export class Twitter extends Extractor {
	
    private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly
	
	constructor() {
		super({
			id: "twitter-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Twitter", // Nombre legible para humanos
			version: "0.0.0",
		});
	}
	async deploy(config: Twitter.Deploy.Config, options: Twitter.Deploy.Options): Promise<Response<unknown>> {
		// bearerToken = AAAAAAAAAAAAAAAAAAAAAJewJQEAAAAAPOlJ%2BAGXOMiIAG7dDUUtTaFAOgs%3DKLpEMQCsq33R2kwwnADok1ujE9v65o4eSf34m5b4yupPvGCi40

	   	this.api = Axios.create({
			baseURL: 'https://api.twitter.com/2/tweets',
			responseType: "json",
			headers: {
				'Authorization': 'Bearer '+ config.bearerToken
			}
	  	});
		this.logger.log('Deployed.')
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Twitter.Obtain.Options): Promise<Response<unknown>> {
		/*
		Función para obtener una lista de Tweets, el limite máximo de tweets es de 100
		*/
		const { hashtag, limit, metaKey, minSentenceSize} = options;
		const query = '#'+ hashtag
		this.logger.debug("Searching by hashtag: ", query);

		try {
			const response = await this.api.get(
				'/search/recent', {
					params: {
						max_results: limit,
						query: query
					}
				});
			this.logger.log("Request status: ", response.status);
			const tweets = response.data.data
			const tweetsTexts = tweets.map(function (tweet:any) {
				return tweet.text; 
			});
						
			const analyzer = new Analyzer(this);
			const tweetsTxts: Analyzer.input[] = tweetsTexts.map((content: any) => ({content}));
			this.logger.log("Tweet's Content Length: ", tweetsTxts);
			const filteredTweets = tweetsTxts.filter(tweet => Analyzer.filter(tweet, {minSentenceSize}));
			this.logger.log("Valid tweets: ", filteredTweets.length);
			const analysis = await analyzer.analyze(filteredTweets);
			this.logger.log("Analysis: ", analysis);
			return new Response<Analyzer.Analysis>(this, Response.Status.OK, analysis);
		}
		catch (error) {
			this.logger.error(error.response);
			return new Response<Analyzer.Analysis>(this, Response.Status.ERROR);
		}
        
		return new Response(this, Response.Status.OK);
	}
	async unitaryObtain(options: Twitter.UnitaryObtain.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Twitter.Destroy.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Twitter {
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {
            bearerToken: string;
		}
		export interface Options extends Extractor.Deploy.Options {}
		export interface Response extends Extractor.Deploy.Response {}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {
			hashtag:string;
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
