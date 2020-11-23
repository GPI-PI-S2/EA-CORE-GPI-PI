import { Analyzer } from 'src/Analyzer';
import { DBController } from './';
export abstract class DBAnalysis {
	abstract create(
		enalysis: DBAnalysis.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }>;
	abstract read(_id: DBController.id): Promise<DBAnalysis.Analysis>;
	abstract update(_id: DBController.id, entry: DBAnalysis.Input): Promise<void>;
	abstract delete(_id: DBController.id): Promise<void>;
}
export namespace DBAnalysis {
	export type Input = DBController.input<Analysis>;
	export interface Analysis extends Analyzer.sentiments, DBController.Base {
		_entryId: DBController.id;
		completionDate: string;
		modelVersion: string;
	}
}
