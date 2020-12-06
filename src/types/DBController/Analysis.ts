import { Sentiments } from 'src/Analyzer/Sentiments';
import { DBController } from './';
export abstract class DBAnalysis {
	abstract create(
		enalysis: DBAnalysis.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }>;
	abstract read(_id: DBController.id, _entryId?: string): Promise<DBAnalysis.Analysis>;
	abstract update(_id: DBController.id, entry: DBAnalysis.Input): Promise<void>;
	abstract delete(_id: DBController.id): Promise<void>;
}
export namespace DBAnalysis {
	export type Input = DBController.input<Analysis>;
	export interface Analysis extends Sentiments.list, DBController.Base {
		_entryId: DBController.id;
		completionDate: string;
		modelVersion: string;
	}
}
