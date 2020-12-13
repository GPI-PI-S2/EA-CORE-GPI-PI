import { Sentiments } from 'lib/ieom2/dist/Sentiments';
import { Anal } from 'src/Analyzer';
import { DBAnalysis } from './Analysis';
import { DBEntry } from './Entry';
export * from './Analysis';
export * from './Entry';
export abstract class DBController {
	abstract readonly $entry: DBEntry;
	abstract readonly $analysis: DBAnalysis;
	abstract connect(): Promise<void>;
	abstract disconnect(): Promise<void>;
	abstract calc(metaKey: string): Promise<DBController.calcResult>;
	abstract stats(): Promise<{ [key: string]: number }>;
	abstract insert(analysis: Anal.Analysis, force: boolean): Promise<void>;
	abstract bulkDB(dbPath: string): Promise<DBController.bulkDBResult>;
}
export namespace DBController {
	export type id = string | number;
	export interface Base {
		_id: id;
		_deleted: boolean;
	}
	export type input<T extends Base> = Partial<Omit<T, '_id' | '_deleted'>>;
	export interface Paginator {
		page: number;
		size: number;
	}
	export interface PaggedList<T extends unknown> {
		list: T[];
		size: number;
		page: number;
		total: number;
	}
	export interface bulkDBResult {
		accepted: number;
		rejected: number;
	}
	export interface calcResult {
		total: number;
		sentiments: Sentiments.list;
	}
}
