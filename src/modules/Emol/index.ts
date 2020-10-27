import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";
import axios from 'axios'

export class Emol extends Extractor {
	/*
    private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly
    */
	constructor() {
		super({
			id: "emol-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Emol", // Nombre legible para humanos
			version: "0.0.0",
		});
	}
	async deploy(config: Emol.Deploy.Config, options: Emol.Deploy.Options): Promise<Response> {
		/*
		// Se crea instancia de axios con el endpoint de la api
		// https://github.com/axios/axios#axios-api
		this.api = Axios.create({
			baseURL: "https://api.test", // Base URL,
			responseType: "json",
			headers: {
				// Se añade la api key en el header
				"api-key": config.apiKey,
			},
        });
        */
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Emol.Obtain.Options): Promise<Response> {
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
	   const { url } = options
	   try {
		   const response = await axios.get(url)
		   // TODO: NORMALIZAR CORRECTAMENTE LOS COMENTARIOS
		   // *Hay comentarios que son fotos, esos se eliminan
		   const comments: string[] = []
		   response.data.comments.forEach(({ text } : { text:string }) => {
			   const comment:string = text.replace('&nbsp;', '')
			   if(comment !== '  ') comments.push(comment)
		   })
		   return new Response(this, Response.Status.OK, comments)
	   } catch (error) {
		   return new Response(this, Response.Status.ERROR, error)
	   }
	}
	async unitaryObtain(options: Emol.UnitaryObtain.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Emol.Destroy.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Emol {
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
			url: string;
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
