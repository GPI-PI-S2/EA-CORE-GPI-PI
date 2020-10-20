export class CError extends Error {
	static isPrintable(error: Error) {
		if (error instanceof Error) {
			return (error as any).printable ? true : false;
		} else {
			return false;
		}
	}
	private _error: any;
	private printable: boolean;
	constructor(message: string, error?: any) {
		super(message);
		this._error = error;
		this.printable = true;
	}
}
