/**
 * Make a left outer join operation between two arrays (** only ** mode)
 *
 * @param array1 "left" array
 * @param array2 "right" array
 * @param  key common key to make the join
 * @returns array
 */
export function arrayLeftOuterJoin<T extends any>(array1: T[], array2: T[], key?: keyof T) {
	const map: any = {};
	for (const elem of array2) {
		const _e = key ? elem[key] : elem;
		map[_e] = 1;
	}
	const result: any = [];
	for (let i = 0; i < array1.length; i++) {
		const _e = key ? (array1 as any)[i][key] : array1[i];
		if (!(_e in map)) {
			result.push(array1[i]);
		}
	}
	return result;
}
export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
	let cTimeout: NodeJS.Timeout;
	return (...args: Parameters<F>): Promise<ReturnType<F>> =>
		new Promise((resolve) => {
			if (cTimeout) {
				clearTimeout(cTimeout);
			}

			cTimeout = setTimeout(() => resolve(func(...args)), waitFor);
		});
};
export function deepObjectCompare(...o: { [key: string]: any }[]): boolean {
	function arraysIdentical(a: any[], b: any[]) {
		let i = a.length;
		if (i !== b.length) return false;
		while (i--) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}
	function iter(cO: { [key: string]: any }, array: any[]) {
		Object.keys(cO).forEach((k) => {
			if (cO[k] !== null && typeof cO[k] === "object") {
				iter(cO[k], array);
				return;
			}
			array.push(cO[k]);
		});
	}
	let state: boolean = true;
	o.reduce((prev, obj) => {
		const a: any[] = [];
		const b: any[] = [];
		iter(prev, a);
		iter(obj, b);
		if (!arraysIdentical(a, b)) state = false;
		return prev;
	});
	return state;
}
export function isObject(obj: any): boolean {
	return obj && typeof obj === "object";
}
export function objAssignDeep<T extends { [key: string]: any } = { [key: string]: any }>(...objs: T[]): T {
	return objs.reduce((prev: { [key: string]: any }, obj: { [key: string]: any }) => {
		Object.keys(obj).forEach((key) => {
			const pVal: any = prev[key];
			const oVal: any = obj[key];
			if (Array.isArray(pVal) && Array.isArray(oVal)) {
				prev[key] = pVal.concat(...oVal);
			} else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = objAssignDeep(pVal, oVal);
			} else {
				prev[key] = oVal;
			}
		});
		return prev;
	}, {}) as any;
}
export function objAssignDeepClearArray<T extends { [key: string]: any } = { [key: string]: any }>(...objs: T[]): T {
	return objs.reduce((prev: { [key: string]: any }, obj: { [key: string]: any }) => {
		Object.keys(obj).forEach((key) => {
			const pVal: any = prev[key];
			const oVal: any = obj[key];
			if (Array.isArray(pVal) && Array.isArray(oVal)) {
				prev[key] = [...oVal];
			} else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = objAssignDeepClearArray(pVal, oVal);
			} else {
				prev[key] = oVal;
			}
		});
		return prev;
	}, {}) as any;
}
/**
 * Clone object without observers
 * @param obj
 * @returns obj
 */
export function objClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
export function objMap<O>(obj: O, fn: any) {
	return Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));
}
export function queryNormalize(query: { [key: string]: string }) {
	return (
		"?" +
		Object.entries(query)
			.filter((q) => q[1])
			.map((q) => `${q[0]}=${encodeURI(q[1])}`)
			.join("&")
	);
}
export function random(min: number, max: number, include: boolean = false): number {
	return include ? Math.floor(Math.random() * (max - min + 1)) + min : Math.floor(Math.random() * (max - min)) + min;
}
export function timeout(miliseconds: number) {
	return new Promise((r) => {
		setTimeout(() => r(), miliseconds);
	});
}
