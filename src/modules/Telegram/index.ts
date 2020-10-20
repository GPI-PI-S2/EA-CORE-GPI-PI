import { Extractor } from "../Extractor";
import { Response } from "../Extractor/Response";
import { Api } from "./Api";

export class Telegram extends Extractor {
	api: Api;
	constructor() {
		super({
			id: "telegram-extractor", // Identificador, solo letras minúsculas y guiones (az-)
			name: "Telegram", // Nombre legible para humanos
			version: "0.0.0",
		});
	}
	async deploy(config: Telegram.Deploy.Config, options: Telegram.Deploy.Options): Promise<Response> {
		try {
			this.logger.debug({ config, options });
			this.api = new Api(config);
			const sigIn = await this.api.sigIn(options);
			if (!sigIn.status)
				return new Response<Telegram.Deploy.PendingResponse>(this, Response.Status.PENDING, {
					message: sigIn.message,
					codeHash: sigIn.codeHash,
				});
			// Acá
			return new Response(this, Response.Status.OK);
		} catch (error) {
			return new Response(this, Response.Status.ERROR, error);
		}
	}
	async obtain(options: Telegram.Obtain.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
	async unitaryObtain(options: Telegram.UnitaryObtain.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
	async destroy(options: Telegram.Destroy.Options): Promise<Response> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Telegram {
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {
			apiId: number;
			apiHash: string;
		}
		export interface Options extends Extractor.Deploy.Options {
			phone: string;
			code?: number;
			codeHash?: string;
		}
		export interface Response extends Extractor.Deploy.Response {}
		export interface PendingResponse extends Extractor.Deploy.PendingResponse {
			codeHash: string;
		}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {}
		export interface Response extends Extractor.Obtain.Response {}
		export interface PendingResponse extends Extractor.Obtain.PendingResponse {}
	}
	export namespace UnitaryObtain {
		export interface Options extends Extractor.UnitaryObtain.Options {}
		export interface Response extends Extractor.UnitaryObtain.Response {}
		export interface PendingResponse extends Extractor.UnitaryObtain.PendingResponse {}
	}
	export namespace Destroy {
		export interface Options extends Extractor.Destroy.Options {}
		export interface Response extends Extractor.Destroy.Response {}
		export interface Destroy extends Extractor.Destroy.PendingResponse {}
	}
}
