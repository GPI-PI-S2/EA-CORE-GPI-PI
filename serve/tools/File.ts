import { isObject } from 'ea-common-gpi-pi';
import fs from 'fs';
export class File {
	constructor(private filepath: string) {}
	private rawContent: Buffer;
	async exist() {
		try {
			const response = await fs.promises.readFile(this.filepath);
			this.rawContent = response;
			return true;
		} catch (error) {
			return false;
		}
	}
	async read<T extends 'string' | 'object'>(
		as: T,
	): Promise<T extends 'string' ? string : object> {
		let raw: Buffer;
		if (this.rawContent) raw = this.rawContent;
		else {
			try {
				raw = await fs.promises.readFile(this.filepath);
			} catch (error) {
				await this.write({});
				raw = await fs.promises.readFile(this.filepath);
			}
		}
		const content = raw.toString();
		if (as === 'string') return content as any;
		return JSON.parse(content);
	}
	async write(content: string | Record<string, unknown>) {
		if (isObject(content)) content = JSON.stringify(content);
		await fs.promises.writeFile(this.filepath, content as string);
		return;
	}
}
