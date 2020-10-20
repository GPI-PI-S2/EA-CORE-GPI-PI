import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";

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
		return new Response(this, Response.Status.OK);
	}
	async unitaryObtain(options: Youtube.UnitaryObtain.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Youtube.Destroy.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Youtube {
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {}
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
