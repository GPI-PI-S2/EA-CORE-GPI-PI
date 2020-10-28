import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";

export class Template extends Extractor {
	constructor() {
		super({
			id: "template-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Template", // Nombre legible para humanos
			version: "0.0.0",
		});
	}
	async deploy(config: Template.Deploy.Config, options: Template.Deploy.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Template.Obtain.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	async unitaryObtain(options: Template.UnitaryObtain.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Template.Destroy.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Template {
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
