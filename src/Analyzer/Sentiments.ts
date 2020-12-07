import natural from 'natural';
import * as data from './v1';
export class Sentiments {
	static readonly version = data.version;
	constructor(private input: string) {}
	calc(): Sentiments.list {
		// sentiments analysis
		// optional, use stemming to improve? word match
		const list = this.getBestFit(this.input);
		const sentiments = list.reduce(
			(sents1, sents2) => this.concatSents(sents1, sents2, (a, b) => a + b),
			data.list,
		);

		const inputChars = this.input.split('');
		const upperCaseTotal =
			inputChars.filter((letter) => letter === letter.toUpperCase()).length /
			inputChars.length;

		const sentimentsUpperCaseFactor =
			upperCaseTotal >= 0.8
				? this.concatSents(sentiments, data.upperCase, (a, b) => a * b)
				: sentiments;

		// AFINN analysis
		const polarity = this.afinn(this.input);
		return polarity >= 0
			? this.concatSents(
					sentimentsUpperCaseFactor,
					data.positivePolarity,
					(a, b) => a * (1 + polarity * b),
			  )
			: this.concatSents(
					sentimentsUpperCaseFactor,
					data.negativePolarity,
					(a, b) => a * (1 - polarity * b),
			  );
	}

	private gramType = 2;

	private getBestFit(input: string): Sentiments.list[] {
		const tokenizer = new natural.AggressiveTokenizerEs();
		const NGrams = natural.NGrams;
		const tokens = tokenizer.tokenize(input.toLowerCase());
		const ngrams = NGrams.ngrams(tokens, this.gramType);
		// generate sets over the tokens so that each token is associated with the resulting nGram (used for multi word matches)
		const tokenSets: string[][] = ngrams.map((tokensNGram) => [
			...tokensNGram,
			tokensNGram.join(', '),
		]);
		return tokenSets.map(
			(set) => this.bestMatch(set.map((word) => this.getSentiments(word)))[1],
		);
	}

	private getSentiments(inputWord: string): [number, Sentiments.list] {
		const sentimentsList: [
			number,
			Sentiments.list,
		][] = data.ieom2.map(({ word, sentiments }) => [
			this.JaroWinker(inputWord, word),
			sentiments,
		]);
		return this.bestMatch(sentimentsList);
	}
	private JaroWinker(str1: string, str2: string): number {
		const JWDistance = natural.JaroWinklerDistance(str1, str2);
		// using the string lenght as a factor the algorithm prefers long matches over short ones (used when multiple matches give similar values)
		return JWDistance * Math.min(str1.length, str2.length);
	}

	private bestMatch(values: [number, Sentiments.list][]): [number, Sentiments.list] {
		return values.reduce(
			(maxValue, currentValue) => (maxValue[0] <= currentValue[0] ? currentValue : maxValue),
			[-1, undefined],
		);
	}

	private concatSents(
		sents1: Sentiments.list,
		sents2: Sentiments.list,
		combineFunction: (a: number, b: number) => number,
	): Sentiments.list {
		// concat sentiments using per factor provided function
		return Object.keys(data.list).reduce(
			(currentValues, key: Sentiments.sentiment) => ({
				...currentValues,
				[key]: combineFunction(sents1[key], sents2[key]),
			}),
			data.list,
		);
	}
	private afinn(input: string) {
		const polarityAnalizer = new natural.SentimentAnalyzer(
			'Spanish',
			natural.PorterStemmerEs,
			'afinn',
		);
		const tokenizer = new natural.AggressiveTokenizerEs();
		return polarityAnalizer.getSentiment(tokenizer.tokenize(input));
	}
}
export namespace Sentiments {
	export type sentiment = data.sentiment;
	export type list = data.list;
}
