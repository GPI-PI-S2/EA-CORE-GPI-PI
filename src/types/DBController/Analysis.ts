import { Analyzer } from 'src/Analyzer';
import { DBController } from './';
export abstract class DBAnalysis {
	abstract create(enalysis: DBAnalysis.Input, force: boolean): Promise<void>;
	abstract read(_id: string): Promise<DBAnalysis.Analysis>;
	abstract update(_id: string, entry: DBAnalysis.Input): Promise<void>;
	abstract delete(_id: string): Promise<void>;
}
export namespace DBAnalysis {
	export type Input = DBController.input<Analysis>;
	export interface Analysis extends Analyzer.sentiments, DBController.Base {
		_entryId: string;
		completionDate: string;
		modelVersion: string;
	}
}
