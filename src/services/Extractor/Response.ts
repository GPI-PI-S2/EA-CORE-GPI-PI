import { Extractor } from '.';

export class Response<Data extends unknown> {
	readonly status: Response.Status;
	constructor(private extractor: Extractor, status: Response.Status, private data: Data = null) {
		this.status = status;
		if (data instanceof Error) (this.status as Response.Status) = Response.Status.ERROR;
	}
	get(): Data {
		return this.data;
	}
}
export namespace Response {
	export enum Status {
		'ERROR',
		'NOT_IMPLEMENTED',
		'PENDING',
		'OK',
	}
}
