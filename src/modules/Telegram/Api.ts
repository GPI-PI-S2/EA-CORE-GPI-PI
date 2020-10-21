import { CError } from "@/common/Error";
import { Logger } from "@/common/Logger";
import { MTProto } from "@mtproto/core";

export class Api {
	private readonly logger = new Logger("telegram-api");
	private readonly client: MTProto;
	constructor(private readonly config: Api.Config) {
		this.client = new MTProto({ api_id: config.apiId, api_hash: config.apiHash });
	}
	private async setNearestDC() {
		const response = (await this.client.call("help.getNearestDc", {})) as Api.NearestDC.Response;
		this.client.setDefaultDc(response.nearest_dc);
		return;
	}
	async isLogged() {
		let logged = false;
		try {
			await this.client.call("users.getFullUser", {
				id: {
					_: "inputUserSelf",
				},
			});
			logged = true;
		} catch (error) {
			logged = false;
		}
		this.logger.log("is logged?", logged);
		return logged;
	}
	async sigIn(options: Api.SignIn.Options): Promise<{ status: boolean; message: string; codeHash?: string }> {
		try {
			await this.setNearestDC();
			const isLogged = await this.isLogged();
			if (!isLogged) {
				const response = await this.client.call("auth.signIn", {
					phone_number: options.phone,
					phone_code: options.code,
					phone_code_hash: options.codeHash,
				});
				this.logger.debug("sigIn Ok", response);
			}
			return { status: true, message: "ok" };
		} catch (error) {
			const apiError: Api.Error = error;
			this.logger.error(error);
			switch (apiError.error_message) {
				case "PHONE_CODE_EXPIRED":
					throw new CError("Código de verificación expirado");
				case "PHONE_CODE_INVALID":
					throw new CError("Código de verificación inválido");
				case "PHONE_NUMBER_INVALID":
					throw new CError("Número de teléfono inválido");
				case "PHONE_NUMBER_UNOCCUPIED":
					throw new CError("Código no asignado al número ingresado");
			}
			if (apiError.error_message != "PHONE_CODE_EMPTY") throw new CError("Error al intentar ingresar", error);
		}
		try {
			this.logger.debug("send code");
			const response = (await this.client.call("auth.sendCode", {
				phone_number: options.phone,
				api_id: this.config.apiId,
				api_hash: this.config.apiHash,
				settings: { _: "codeSettings" },
			})) as Api.SendCode.Response;
			this.logger.debug("sent code", response);
			return {
				status: false,
				message:
					"Se ha enviado un código de verificación a su cuenta de Telegram. Ingréselo para poder continuar",
				codeHash: response.phone_code_hash,
			};
		} catch (error) {
			const apiError: Api.Error = error;
			// TODO implementar autenticación "2FA"
			if (apiError.error_message === "SESSION_PASSWORD_NEEDED")
				throw new CError("Error al intentar generar el código", apiError);
		}
	}
}
export namespace Api {
	export type errorMessage =
		| "PHONE_CODE_EXPIRED"
		| "PHONE_CODE_INVALID"
		| "PHONE_NUMBER_INVALID"
		| "PHONE_NUMBER_UNOCCUPIED"
		| "SESSION_PASSWORD_NEEDED"
		| string;
	export interface Config {
		apiId: number;
		apiHash: string;
	}
	export interface Error {
		_: string;
		error_code: number;
		error_message: Api.errorMessage;
	}
	export namespace SendCode {
		export interface Response {
			phone_code_hash: string;
		}
	}
	export namespace NearestDC {
		export interface Response {
			_: "nearestDc";
			country: string;
			this_dc: number;
			nearest_dc: number;
		}
	}
	export namespace SignIn {
		export interface Options {
			phone: string;
			code?: number;
			codeHash?: string;
		}
	}
}
