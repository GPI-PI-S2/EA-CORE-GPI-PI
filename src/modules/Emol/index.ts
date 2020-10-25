import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";
import axios from 'axios'

export class Emol extends Extractor {
	constructor() {
		super({
			id: "emol-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Emol", // Nombre legible para humanos
			version: "0.0.0",
		});
	}
	async deploy(config: Emol.Deploy.Config, options: Emol.Deploy.Options): Promise<Response> {
		this.logger.debug('HOLS');
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Emol.Obtain.Options): Promise<Response> {
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
		export interface Config extends Extractor.Deploy.Config {}
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
