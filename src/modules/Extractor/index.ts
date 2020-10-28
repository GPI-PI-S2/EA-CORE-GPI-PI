import { Logger } from "@/common/Logger";
import { Response } from "./Response";

export abstract class Extractor {
	static readonly version = "0.0.0";
	protected logger: Logger;
	constructor(private _register: Extractor.Register) {
		this.logger = new Logger(_register.id);
	}
	get register() {
		return { ...this._register, extractorVersion: Extractor.version };
	}
	abstract async deploy(
		config: Extractor.Deploy.Config,
		options: Extractor.Deploy.Options,
	): Promise<Response<Extractor.Deploy.Response>>;
	abstract async obtain(config: Extractor.Obtain.Options): Promise<Response<unknown>>;
	abstract async unitaryObtain(
		config: Extractor.UnitaryObtain.Options,
	): Promise<Response<Extractor.UnitaryObtain.Response>>;
	abstract async destroy(config: Extractor.Destroy.Options): Promise<Response<unknown>>;
}
export namespace Extractor {
	export interface Register {
		id: string;
		name: string;
		version: string;
	}
	interface Peding {
		message: string;
	}
	export namespace Deploy {
		export interface Config {}
		export interface Options {}
		export interface Response {}
		export interface PendingResponse extends Peding {}
	}
	export namespace Obtain {
		export interface Options {
			metaKey: string;
			limit: number;
			minSentenceSize: number;
		}
		export interface Response {}
		export interface PendingResponse extends Peding {}
	}
	export namespace UnitaryObtain {
		export interface Options {
			metaKey: string;
		}
		export interface Response {}
		export interface PendingResponse extends Peding {}
	}
	export namespace Destroy {
		export interface Options {}
		export interface Response {}
		export interface PendingResponse extends Peding {}
	}
}
