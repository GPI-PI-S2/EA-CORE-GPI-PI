import { Analyzer } from 'src/Analyzer';
import { DBAnalysis } from './Analysis';
import { DBEntry } from './Entry';
export * from './Analysis';
export * from './Entry';
export abstract class DBController {
	abstract readonly $entry: DBEntry;
	abstract readonly $analysis: DBAnalysis;
	abstract calc(metaKey: string): Promise<DBController.calcResult>;
	abstract stats(): Promise<{ [key: string]: number }>;
	abstract insert(analysis: Analyzer.Analysis, force: boolean): Promise<void>;
	abstract bulkDB(dbPath: string): Promise<DBController.bulkDBResult>;
}
export namespace DBController {
	export interface Base {
		_id: string;
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
		sentiments: Analyzer.sentiments;
	}
}
