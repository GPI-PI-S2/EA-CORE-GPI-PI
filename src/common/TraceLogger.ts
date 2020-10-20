import { Logger } from "./Logger";

export class TraceLogger {
	readonly id = Math.floor(Math.random() * 999 + 1);
	constructor(private readonly logger: Logger = null) {}
	private resolveLog(type: Logger.Type, ...content: any[]) {
		const logger = this.logger ? this.logger : Logger;
		switch (type) {
			case Logger.Type.DEBUG:
				return logger.debug(...content);
			case Logger.Type.ERROR:
				return logger.debug(...content);
			case Logger.Type.LOG:
				return logger.debug(...content);
			case Logger.Type.WARN:
				return logger.debug(...content);
		}
	}
	log(...content: any[]) {
		this.resolveLog(Logger.Type.LOG, `[${this.id}]`, content);
	}
	warn(...content: any[]) {
		this.resolveLog(Logger.Type.WARN, `[${this.id}]`, content);
	}
	error(...content: any[]) {
		this.resolveLog(Logger.Type.ERROR, `[${this.id}]`, content);
	}

	debug(...content: any[]) {
		this.resolveLog(Logger.Type.DEBUG, `[${this.id}]`, content);
	}
}
