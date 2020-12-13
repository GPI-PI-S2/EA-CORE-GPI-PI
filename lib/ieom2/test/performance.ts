import anal from '../src';
import sentimentList from './sentences.json';
function main() {
	const length = sentimentList.sentences.length;
	console.log('\nPerformance test (single)\n');
	console.log('Length:', length);
	console.log('Calculating...');
	console.time('Duration');
	sentimentList.sentences.forEach((sentence) => anal(sentence));
	console.log('\n');
	console.timeEnd('Duration');
	console.log('\n');
	console.log('Ended');
}
main();
