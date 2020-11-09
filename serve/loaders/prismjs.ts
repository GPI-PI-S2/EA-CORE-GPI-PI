import { JSDOM } from 'jsdom';
import Prism from 'prismjs';
import theme from './chalk';
const { languages } = Prism;
const lang = 'javascript';
function parseFormatedContent(domElement: any, recLevel: number) {
	let highlightedSource = '';
	domElement.forEach((element: any, index: number) => {
		if (element.hasChildNodes()) {
			let hlCode = getHighlightToken((element as any).classList);
			highlightedSource += hlCode(parseFormatedContent(element.childNodes, recLevel + 1));
		} else {
			highlightedSource += element.textContent;
		}
	});
	function getHighlightToken(tokens: any) {
		let tokenFound = null;
		const themeTokenKeys = Object.keys(theme.token);
		for (let i = 0; i < tokens.length; i++) {
			if (themeTokenKeys.indexOf(tokens[i]) !== -1) {
				tokenFound = theme.token[tokens[i]];
				break;
			}
		}
		if (tokenFound !== null) {
			return tokenFound;
		} else {
			return (content: any) => {
				return content;
			};
		}
	}
	return highlightedSource;
}
export default (obj: string) => {
	// Parse source code and return HTML from PrismJS output
	const prismCode = Prism.highlight(obj, languages[lang], lang);

	// load HTML fragment
	const dom = JSDOM.fragment(prismCode);

	return parseFormatedContent(dom.childNodes, 0);
};
