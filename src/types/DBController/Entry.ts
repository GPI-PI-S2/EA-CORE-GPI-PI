import { DBController } from './';
export abstract class DBEntry {
	abstract create(entry: DBEntry.Input, force: boolean): Promise<void>;
	abstract read(_id: string): Promise<DBEntry.Entry>;
	abstract update(_id: string, entry: DBEntry.Input): Promise<void>;
	abstract delete(_id: string): Promise<void>;
	abstract list(
		paginator: DBController.Paginator,
		filter?: DBEntry.Filter,
	): Promise<DBController.PaggedList<DBEntry.Entry>>;
}
export namespace DBEntry {
	export type Input = DBController.input<Entry>;
	export interface Entry extends DBController.Base {
		hash: string;
		created: string;
		extractor: string;
		metaKey: string;
		content: string;
		_entryId: string;
	}
	export interface Filter {
		extractor?: string;
		metaKey?: string;
		created?: boolean;
	}
}
