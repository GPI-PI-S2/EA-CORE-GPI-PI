import { DBController } from './';
export abstract class DBEntry {
	abstract create(entry: DBEntry.Input, force: boolean): Promise<{ _id: DBController.id }>;
	abstract read(_id: DBController.id): Promise<DBEntry.Entry>;
	abstract update(_id: DBController.id, entry: DBEntry.Input): Promise<void>;
	abstract delete(_id: DBController.id): Promise<void>;
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
	}
	export interface Filter {
		extractor?: string;
		metaKey?: string;
		created?: boolean;
	}
}
