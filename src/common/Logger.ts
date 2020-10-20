import { DEBUG } from "./const";

export class Logger {
	static log(...content: any[]) {
		if (DEBUG) console.log(...content);
		Logger.watcher({ logType: Logger.Type.LOG, content });
	}
	static warn(...content: any[]) {
		if (DEBUG) console.warn(...content);
		Logger.watcher({ logType: Logger.Type.WARN, content });
	}
	static error(...content: any[]) {
		if (DEBUG) console.error(...content);
		Logger.watcher({ logType: Logger.Type.ERROR, content });
	}
	static debug(...content: any[]) {
		if (DEBUG) console.debug(...content);
		Logger.watcher({ logType: Logger.Type.DEBUG, content });
	}
	static watcher: (logType: Logger.config) => void = () => {};
	constructor(private type: string) {}
	log(...content: any[]) {
		if (DEBUG) console.log(`[${this.type}]`, ...content);
		Logger.watcher({ logType: Logger.Type.LOG, type: this.type, content });
	}

	warn(...content: any[]) {
		if (DEBUG) console.warn(`[${this.type}]`, ...content);
		Logger.watcher({ logType: Logger.Type.WARN, type: this.type, content });
	}
	error(...content: any[]) {
		if (DEBUG) console.error(`[${this.type}]`, ...content);
		Logger.watcher({ logType: Logger.Type.ERROR, type: this.type, content });
	}

	debug(...content: any[]) {
		if (DEBUG) console.debug(`[${this.type}]`, ...content);
		Logger.watcher({ logType: Logger.Type.DEBUG, type: this.type, content });
	}
}
export namespace Logger {
	export enum Type {
		"LOG",
		"WARN",
		"ERROR",
		"DEBUG",
	}
	export interface config {
		logType: Type;
		type?: string;
		content: any[];
	}
}
