import _readline from "readline";
const readline = _readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
export class Readline {
	static read(query: string): Promise<string> {
		return new Promise((r) => {
			readline.question(`> ${query}: `, (answer) => {
				return r(answer);
			});
		});
	}
}
