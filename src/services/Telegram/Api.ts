import { MTProto } from '@mtproto/core';
import { CError } from 'ea-common-gpi-pi';
import { container } from 'tsyringe';
import { Logger } from 'winston';
export class Api {
	private readonly client: MTProto;
	private logger: Logger = container.resolve('logger');
	constructor(private readonly config: Api.Config) {
		this.client = new MTProto({ api_id: config.apiId, api_hash: config.apiHash });
	}
	private async setNearestDC() {
		const response = (await this.client.call(
			'help.getNearestDc',
			{},
		)) as Api.NearestDC.Response;
		this.client.setDefaultDc(response.nearest_dc);
		return;
	}
	async isLogged(): Promise<boolean> {
		let logged = false;
		try {
			await this.client.call('users.getFullUser', {
				id: {
					_: 'inputUserSelf',
				},
			});
			logged = true;
		} catch (error) {
			logged = false;
		}
		this.logger.silly('is logged?', logged);
		return logged;
	}
	async sigIn(
		options: Api.SignIn.Options,
	): Promise<{ status: boolean; message: string; codeHash?: string }> {
		try {
			await this.setNearestDC();
			const isLogged = await this.isLogged();
			if (!isLogged) {
				const response = await this.client.call('auth.signIn', {
					phone_number: options.phone,
					phone_code: options.code,
					phone_code_hash: options.codeHash,
				});
				this.logger.silly('sigIn Ok', response);
			}
			return { status: true, message: 'ok' };
		} catch (error) {
			const apiError: Api.Error = error;
			this.logger.error('sigIn error', error);
			switch (apiError.error_message) {
				case 'PHONE_CODE_EXPIRED':
					throw new CError('Código de verificación expirado');
				case 'PHONE_CODE_INVALID':
					throw new CError('Código de verificación inválido');
				case 'PHONE_NUMBER_INVALID':
					throw new CError('Número de teléfono inválido');
				case 'PHONE_NUMBER_UNOCCUPIED':
					throw new CError('Código no asignado al número ingresado');
			}
			if (apiError.error_message != 'PHONE_CODE_EMPTY')
				throw new CError('Error al intentar ingresar', error);
		}
		try {
			this.logger.silly('send code');
			const response = (await this.client.call('auth.sendCode', {
				phone_number: options.phone,
				api_id: this.config.apiId,
				api_hash: this.config.apiHash,
				settings: { _: 'codeSettings' },
			})) as Api.SendCode.Response;
			this.logger.silly('sent code', response);
			return {
				status: false,
				message:
					'Se ha enviado un código de verificación a su cuenta de Telegram. Ingréselo para poder continuar',
				codeHash: response.phone_code_hash,
			};
		} catch (error) {
			const apiError: Api.Error = error;
			// TODO implementar autenticación "2FA"
			if (apiError.error_message === 'SESSION_PASSWORD_NEEDED')
				throw new CError('Error al intentar generar el código', apiError);
		}
	}
	async getDialogs(limit: number): Promise<Api.GetDialogs.Response> {
		try {
			this.logger.silly('Obteniendo dialogos');
			const response = (await this.client.call('messages.getDialogs', {
				limit,
				offset_peer: { _: 'inputPeerEmpty' },
			})) as Api.GetDialogs.Response;
			this.logger.silly('Dialogos obtenidos', response);
			return response;
		} catch (error) {
			const apiError: Api.Error = error;
			throw new CError('Error al intentar obtener los chats', apiError);
		}
	}
	async getHistory(options: Api.GetHistory.Options): Promise<Api.GetHistory.Response> {
		try {
			const { limit, max_id, peer } = options;
			this.logger.silly('Obteniendo mensajes');
			const response = await this.client.call('messages.getHistory', {
				peer,
				limit,
				max_id,
			});
			return response as Api.GetHistory.Response;
		} catch (error) {
			const apiError: Api.Error = error;
			throw new CError('Error al intentar obtener los mensajes', apiError);
		}
	}
}
export namespace Api {
	type conversation<peer extends string> = {
		_: peer;
		id: number;
		access_hash: string;
	};
	export type errorMessage =
		| 'PHONE_CODE_EXPIRED'
		| 'PHONE_CODE_INVALID'
		| 'PHONE_NUMBER_INVALID'
		| 'PHONE_NUMBER_UNOCCUPIED'
		| 'SESSION_PASSWORD_NEEDED'
		| string;
	export type user = conversation<'user'> & {
		self: boolean;
		username?: string;
		first_name?: string;
		last_name?: string;
		deleted?: true;
		restricted?: true;
		support?: true;
		bot?: true;
		phone?: string;
	};
	export type channel = conversation<'channel'> & {
		title: string;
		username?: string;
		participants_count?: number;
		restricted?: true;
		left?: boolean;
	};
	export type chat = conversation<'chat'> & {
		title: string;
		kicked?: true;
		deactivated?: true;
		left?: boolean;
		participants_count?: number;
	};
	export type peerChat = {
		_: 'inputPeerChat';
		chat_id: number;
	};
	export type peerUser = {
		_: 'inputPeerUser';
		user_id: number;
		access_hash: string;
	};
	export type peerChannel = {
		_: 'inputPeerChannel';
		channel_id: number;
		access_hash: string;
	};
	export type message = {
		_: 'message';
		id: number;
		from_id: number;
		to_id: number;
		message: string;
	};
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
	export namespace GetDialogs {
		export interface Response {
			_: 'messages.dialogsSlice';
			count: number;
			chats: (chat | channel)[];
			users: user[];
		}
	}
	export namespace GetHistory {
		export interface Options {
			peer: peerChannel | peerChat | peerUser;
			limit: number;
			max_id: number;
		}
		export interface Response {
			messages: message[];
		}
	}
	export namespace NearestDC {
		export interface Response {
			_: 'nearestDc';
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
