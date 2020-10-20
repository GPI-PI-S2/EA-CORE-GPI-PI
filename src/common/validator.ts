namespace Validator {
	export type Scope = "pass";
	export type ruler =
		| "required"
		| "min"
		| "max"
		| "between"
		| "number"
		| "range-min"
		| "range-max"
		| "range-between"
		| "e-mail"
		| "url"
		| "az"
		| "date"
		| "AZ"
		| "alphanumeric"
		| "alphanumeric-extended"
		| "valid-string"
		| "valid-string-extended"
		| "no-whitespaces"
		| "run"
		| "rut"
		| "phone"
		| "nickname";
	export type fn = (input: string) => true | string;
}
class Validator {
	private static errors = {
		required: "El campo es requerido",
		min: "El campo debe tener como mínimo _$1_ caracteres",
		max: "El campo debe tener como máximo _$1_ caracteres",
		date: "La fecha es inválida",
		between: "El campo debe tener entre _$1_ y _$2_ caracteres",
		number: "Número no válido",
		"range-min": "El campo tiene que ser mayor o igual a _$1_",
		"range-max": "El campo tiene que ser menor o igual a _$1_",
		"range-between": "El rango es desde _$1_ a _$2_",
		"e-mail": "Correo electrónico inválido",
		url: "URL no válida",
		alphanumeric: "Solo están permitidos letras y números",
		"alphanumeric-extended": "Solo están permitidos letras y números",
		"valid-string": "El campo contiene caracteres no válidos",
		"valid-string-extended": "El campo contiene caracteres no válidos",
		"no-whitespaces": "No están permitidos los espacios",
		run: "RUN inválido",
		rut: "RUT inválido",
		"required--pass": "La contraseña es requerida",
		"between--pass": "La contraseña debe tener entre _$1_ y _$2_ caracteres",
		"min--pass": "La contraseña debe tener como mínimo _$1_ caracteres",
		"max--pass": "La contraseña debe tener como máximo _$1_ caracteres",
		"e-mail--pass": "Error",
		"alphanumeric--pass": "Solo están permitidos letras y números",
		"valid-string-extended--pass": "La contraseña contiene caracteres no válidos",
		"no-whitespaces--pass": "La contraseña no puede tener espacios",
		phone: "El número telefónico no es válido",
		nickname: "El nombre de usuario contiene caracteres no válidos (solo letras minúsculas,números y puntos)",
	};
	static rules = {
		required: (i: string, scope?: Validator.Scope) => (i ? true : false) || Validator.error("required", scope),
		min: (i: string, min: number, scope?: Validator.Scope) =>
			(i && i.length >= min) || Validator.error("min", scope, min.toString()),
		max: (i: string, max: number, scope?: Validator.Scope) =>
			(i ? i.length <= max : true) || Validator.error("max", scope, max.toString()),
		between: (i: string, min: number, max: number, scope?: Validator.Scope) =>
			(i && i.length >= min && i.length <= max) ||
			Validator.error("between", scope, min.toString(), max.toString()),
		number: (i: string, scope?: Validator.Scope) =>
			(i ? true : false && Number(i)) ? true : false || Validator.error("number", scope),
		rangeMin: (i: string, min: number, scope?: Validator.Scope) =>
			(i && Number(i) && Number(i) >= min) || Validator.error("range-min", scope, min.toString()),
		rangeMax: (i: string, max: number, scope?: Validator.Scope) =>
			(i ? Number(i) && Number(i) <= max : true) || Validator.error("range-max", scope, max.toString()),
		rangeBetween: (i: string, min: number, max: number, scope?: Validator.Scope) =>
			(i && Number(i) && Number(i) >= min && Number(i) <= max) ||
			Validator.error("range-between", scope, min.toString(), max.toString()),
		email: (i: string, scope?: Validator.Scope) =>
			(i
				? /^$|^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/.test(i)
				: true) || Validator.error("e-mail", scope),
		phone: (i: string, scope?: Validator.Scope) =>
			(i ? /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(i) : true) || Validator.error("phone", scope),
		date: (i: string, scope?: Validator.Scope) =>
			(i
				? /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/.test(
						i,
				  )
				: true) || Validator.error("date", scope),
		url: (i: string, scope?: Validator.Scope) =>
			(i ? /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(i) : true) ||
			Validator.error("url", scope),
		alphanumeric: (i: string, scope?: Validator.Scope) =>
			(i ? /^$|^[a-zA-Z0-9\s]*$/.test(i) : true) || Validator.error("alphanumeric", scope),
		alphanumericExtended: (i: string, scope?: Validator.Scope) =>
			(i
				? /^$|^[0-9A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]+(?:['-.,][0-9A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]+)*[.]?$/.test(
						i,
				  )
				: true) || Validator.error("alphanumeric-extended", scope),
		validString: (i: string, scope?: Validator.Scope) =>
			(i ? /^$|^[a-zA-Z\s]*$/.test(i) : true) || Validator.error("valid-string", scope),
		validStringExtended: (i: string, scope?: Validator.Scope) =>
			(i
				? /^$|^[A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]+(?:['-][A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]+)*$/.test(
						i,
				  )
				: true) || Validator.error("valid-string-extended", scope),
		noWhitespaces: (i: string, scope?: Validator.Scope) =>
			(i ? /^$|^[\S]+$/.test(i) : true) || Validator.error("no-whitespaces", scope),
		rolUnico: (i: string, t: "run" | "rut" = "run", scope?: Validator.Scope) => {
			if (!i) return true;
			const r = i.slice(0, i.length - 1);
			const v = i.slice(-1).toLowerCase();
			const s = [2, 3, 4, 5, 6, 7];
			if (r.length < 1 || v.length < 1 || !Number(r) || (v === "k" ? false : !Number(v)))
				return Validator.error(t, scope);
			const res = (
				11 -
				(r
					.split("")
					.map((c) => Number(c))
					.reverse()
					.map((c, x) => c * s[((x % s.length) + s.length) % s.length])
					.reduce((a, c) => a + c) %
					11)
			).toString();
			return (res === "10" ? "k" === v : res === v) || Validator.error(t, scope);
		},
		nickname: (i: string, scope?: Validator.Scope) =>
			(i ? /^[a-z]([a-z0-9]*[\.]?[a-z0-9]*)*[a-z0-9]+$/.test(i) : true) || Validator.error("nickname", scope),
	};
	private static addToText(base: string, ...keys: string[]): string {
		let response: string = "";
		if (base.indexOf("_$") < 0 || !keys || keys[0] === "") return base;
		base.split("_$")
			.filter((e) => e !== "")
			.map((e) => {
				const el = e.split("_")[0] as any;

				if (!Number.isNaN(el) && keys[Number(el) - 1])
					response = (response ? response : base).replace(`_$${Number(el)}_`, keys[Number(el) - 1]);
				return e;
			});
		return response;
	}
	private static error(e: string, scope?: Validator.Scope, ...a: string[]): string {
		const cError = `${e}${scope ? `--${scope}` : ""}`;
		return Validator.addToText((Validator as any).errors[cError], ...a);
	}
}
export function vMin(n: number, scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.min(i, n, scope);
}
export function vMax(n: number, scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.max(i, n, scope);
}
export function vBetween(min: number, max: number, scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.between(i, min, max, scope);
}
export function vRangeMin(n: number, scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.rangeMin(i, n, scope);
}
export function vRangeMax(n: number, scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.rangeMax(i, n, scope);
}
export function vRangeBetween(min: number, max: number, scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.rangeBetween(i, min, max, scope);
}
export function vRolUnico(t: "run" | "rut" = "run", scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.rolUnico(i, t, scope);
}
export function vRequired(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.required(i, scope);
}
export function vNumber(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.number(i, scope);
}
export function vEmail(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.email(i, scope);
}
export function vUrl(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.url(i, scope);
}
export function vAlphanumeric(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.alphanumeric(i, scope);
}
export function vAlphanumericExtended(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.alphanumericExtended(i, scope);
}
export function vValidString(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.validString(i, scope);
}
export function vValidStringExtended(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.validStringExtended(i, scope);
}
export function vNoWhitespaces(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.noWhitespaces(i, scope);
}
export function vDate(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.date(i, scope);
}
export function vPhone(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.phone(i, scope);
}
export function vNickname(scope?: Validator.Scope): Validator.fn {
	return (i: string) => Validator.rules.nickname(i, scope);
}
export function arrayValidation(input: string, functions: Validator.fn[]): boolean | string {
	let error: string = "";
	console.warn("input", input);
	const hasError = functions.some((validationFn) => {
		const validateResponse = validationFn(input);
		console.warn("test", input, validateResponse);
		if (typeof validateResponse === "string") {
			error = validateResponse;
			return true;
		} else return false;
	});
	return hasError ? error : false;
}
