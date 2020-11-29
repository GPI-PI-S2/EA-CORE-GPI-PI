import Joi from 'joi';
import { Response } from './Response';

export abstract class Extractor {
	static readonly version = '0.0.0';
	protected static deployConfigSchema = Joi.object({});
	protected static deployOptionsSchema = Joi.object({});
	protected static obtainOptionsSchema = Joi.object({
		metaKey: Joi.string().max(250).required(),
		limit: Joi.number().min(1).max(1000).required(),
		minSentenceSize: Joi.number().min(1).max(100).optional(),
	});
	constructor(private _register: Extractor.Register) {}
	get register(): Extractor.Register & { extractorVersion: string } {
		return { ...this._register, extractorVersion: Extractor.version };
	}
	abstract deploy(
		config: Extractor.Deploy.Config,
		options: Extractor.Deploy.Options,
	): Promise<Response<Extractor.Deploy.Response>>;
	abstract obtain(config: Extractor.Obtain.Options): Promise<Response<unknown>>;
	abstract unitaryObtain(
		config: Extractor.UnitaryObtain.Options,
	): Promise<Response<Extractor.UnitaryObtain.Response>>;
	abstract destroy(config: Extractor.Destroy.Options): Promise<Response<unknown>>;
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
			minSentenceSize?: number;
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
