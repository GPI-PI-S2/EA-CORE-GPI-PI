import { Sentiments } from './Sentiments';
export = (sentence: string): Sentiments.list => {
	return new Sentiments(sentence).calc();
};
