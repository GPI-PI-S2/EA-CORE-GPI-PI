import { Extractor } from '.';

export class Response<Data extends unknown> {
	readonly status: Response.Status;
	constructor(
		private extractor: Extractor,
		status: Response.Status,
		private _data: Data = null,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		private _error: any = null,
	) {
		this.status = status;
		if (_data instanceof Error) (this.status as Response.Status) = Response.Status.ERROR;
	}
	/**
	 * @deprecated Reemplazada por el getter data
	 */
	get(): Data {
		return this._data;
	}
	get data(): Data {
		return this._data;
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get error(): any {
		return this._error;
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
