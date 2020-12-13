import anal from '../src';
import sentimentList from './sentences.json';
function main() {
	const length = sentimentList.sentences.length;
	const sampleSize = 3;
	console.log('\nAlgorithm test\n');
	console.log('Length:', length);
	console.log('Sample size:', sampleSize);
	console.log('Calculating...');
	new Array(sampleSize).fill(null).forEach(() => {
		const index = Math.floor(Math.random() * length);
		const sentence = sentimentList.sentences[index];
		console.log(`\nsentence:\n${sentence}`);
		const response = anal(sentence);
		console.table(response);
	});
	console.log('Ended');
}
main();
