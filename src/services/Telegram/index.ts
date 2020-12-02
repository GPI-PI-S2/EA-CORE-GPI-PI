import { CError } from 'ea-common-gpi-pi';
import Joi from 'joi';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { Analyzer } from '../../Analyzer';
import { Extractor } from '../Extractor';
import { Response } from '../Extractor/Response';
import { Api } from './Api';

@injectable()
export class Telegram extends Extractor {
	private static parsePeer(peer: Telegram.Obtain.Options): Api.GetHistory.Options['peer'] {
		switch (peer.type) {
			case 'channel':
				return {
					_: 'inputPeerChannel',
					access_hash: peer.accessHash,
					channel_id: peer.chatId,
				} as Api.peerChannel;
			case 'group':
				return { _: 'inputPeerChat', chat_id: peer.chatId } as Api.peerChat;
			case 'user':
				return {
					_: 'inputPeerUser',
					access_hash: peer.accessHash,
					user_id: peer.chatId,
				} as Api.peerUser;
			default:
				throw new CError('Peer Inválido');
		}
	}
	private static parseChats(dialogs: Api.GetDialogs.Response): Telegram.Deploy.chat[] {
		const users = Array.isArray(dialogs.users) ? dialogs.users : [];
		const chats: Api.chat[] = [];
		const channels: Api.channel[] = [];
		if (Array.isArray(dialogs.chats))
			dialogs.chats.forEach((chat) =>
				chat._ === 'channel' ? channels.push(chat) : chats.push(chat),
			);
		let extractorChats: Telegram.Deploy.chat[] = [];
		const readableUsers: Telegram.Deploy.chat[] = users
			.filter(
				(user) =>
					user.id &&
					user.access_hash &&
					!user.restricted &&
					!user.deleted &&
					!user.self &&
					!user.bot &&
					!user.support,
			)
			.map((user) => {
				let name = 'Sin nombre';
				if (user.first_name && user.last_name)
					name = `${user.first_name} ${user.last_name}`;
				else if (user.first_name) name = user.first_name;
				else if (user.last_name) name = user.last_name;
				else if (user.username) name = user.username;
				return { id: user.id, accessHash: user.access_hash, type: 'user', name };
			});
		extractorChats = extractorChats.concat(readableUsers);

		const readableChannels: Telegram.Deploy.chat[] = channels
			.filter(
				(channel) =>
					channel.id && channel.access_hash && !channel.left && !channel.restricted,
			)
			.map((channel) => {
				return {
					id: channel.id,
					accessHash: channel.access_hash,
					type: 'channel',
					name: channel.title,
				};
			});
		extractorChats = extractorChats.concat(readableChannels);

		const readableChats: Telegram.Deploy.chat[] = chats
			.filter(
				(chat) =>
					chat.id && chat.access_hash && !chat.left && !chat.kicked && !chat.deactivated,
			)
			.map((chat) => {
				return {
					id: chat.id,
					accessHash: chat.access_hash,
					type: 'group',
					name: chat.title,
				};
			});
		extractorChats = extractorChats.concat(readableChats);

		return extractorChats;
	}
	protected static deployConfigSchema = Extractor.deployConfigSchema.append({
		apiId: Joi.number().max(1e7).optional(),
		apiHash: Joi.string().optional(),
	});
	protected static deployOptionsSchema = Extractor.deployOptionsSchema.append({
		phone: Joi.string().required(),
		code: Joi.number().max(1e6).optional(),
		codeHash: Joi.string().optional(),
		chatsLimit: Joi.number().min(1).max(100).optional(),
	});
	protected static obtainOptionsSchema = Extractor.obtainOptionsSchema.append({
		chatId: Joi.number().required(),
		accessHash: Joi.string().required(),
		type: Joi.string().required(),
	});
	constructor(@inject('logger') private logger: Logger) {
		super({
			id: 'telegram-extractor', // Identificador, solo letras minúsculas y guiones (az-)
			name: 'Telegram', // Nombre legible para humanos
			version: '1.0.0',
		});
	}
	private api: Api;
	async deploy(
		config: Required<Telegram.Deploy.Config>,
		options: Telegram.Deploy.Options,
	): Promise<Response<Telegram.Deploy.PendingResponse | { chats: Telegram.Deploy.chat[] }>> {
		try {
			this.logger.verbose(`DEPLOY ${this.register.id} v${this.register.version}`, {
				config,
				options,
			});

			const validConfig = Telegram.deployConfigSchema.validate(config);
			const validOptions = Telegram.deployOptionsSchema.validate(options);
			if (validConfig.error || validOptions.error)
				return new Response(this, Response.Status.ERROR, {
					configError: validConfig.error ? validConfig.error.message : undefined,
					optionsError: validOptions.error ? validOptions.error.message : undefined,
				} as never);

			this.api = new Api(config);
			const sigIn = await this.api.sigIn(options);
			if (!sigIn.status) {
				return new Response<Telegram.Deploy.PendingResponse>(
					this,
					Response.Status.PENDING,
					{
						type: 'verification',
						message: sigIn.message,
						codeHash: sigIn.codeHash,
					},
				);
			}
			const chatLimit =
				(options.chatsLimit && options.chatsLimit) > 0 ? options.chatsLimit : 20;
			const dialogs = await this.api.getDialogs(chatLimit);
			const chats = Telegram.parseChats(dialogs);
			return new Response(this, Response.Status.OK, { chats });
		} catch (error) {
			return new Response(this, Response.Status.ERROR, null, error);
		}
	}
	async obtain(options: Telegram.Obtain.Options): Promise<Response<Analyzer.Analysis>> {
		this.logger.verbose(`OBTAIN ${this.register.id} v${this.register.version}`, options);

		const validOptions = Telegram.obtainOptionsSchema.validate(options);
		if (validOptions.error)
			return new Response(this, Response.Status.ERROR, {
				optionsError: validOptions.error ? validOptions.error.message : undefined,
			} as never);
		try {
			const { minSentenceSize, metaKey } = options;
			const peer = Telegram.parsePeer(options);
			const response = await this.api.getHistory({ peer, limit: options.limit, max_id: 0 });
			//const lastId: number = response.messages.length > 0 ? response.messages[0].id : null;
			const RMessages: Analyzer.input[] = response.messages.map((m) => ({
				content: m.message,
			}));
			const filteredMessages = RMessages.filter((message) =>
				Analyzer.filter(message, { minSentenceSize }),
			);
			this.logger.silly(`length: ${filteredMessages.length}`);
			const analyzer = new Analyzer(this);
			const analysis = await analyzer.analyze(filteredMessages, { metaKey });
			return new Response(this, Response.Status.OK, analysis);
		} catch (error) {
			this.logger.silly('OBTAIN error', error);
			return new Response(this, Response.Status.ERROR, null, error);
		}
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async unitaryObtain(_options: Telegram.UnitaryObtain.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async destroy(_options: Telegram.Destroy.Options): Promise<Response<unknown>> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Telegram {
	export namespace Deploy {
		export type chat = {
			type: 'user' | 'group' | 'channel';
			id: number;
			accessHash: string;
			name: string;
		};
		export interface Config extends Extractor.Deploy.Config {
			apiId?: number;
			apiHash?: string;
		}
		export interface Options extends Extractor.Deploy.Options {
			phone: string;
			code?: number;
			codeHash?: string;
			chatsLimit?: number;
		}
		export interface Response extends Extractor.Deploy.Response {
			chats: chat[];
		}
		export interface PendingResponse extends Extractor.Deploy.PendingResponse {
			type: 'verification';
			codeHash: string;
		}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {
			chatId: number;
			accessHash: string;
			type: Deploy.chat['type'];
		}
		export interface Response extends Extractor.Obtain.Response {}
		export interface PendingResponse extends Extractor.Obtain.PendingResponse {}
	}
	export namespace UnitaryObtain {
		export interface Options extends Extractor.UnitaryObtain.Options {}
		export interface Response extends Extractor.UnitaryObtain.Response {}
		export interface PendingResponse extends Extractor.UnitaryObtain.PendingResponse {}
	}
	export namespace Destroy {
		export interface Options extends Extractor.Destroy.Options {}
		export interface Response extends Extractor.Destroy.Response {}
		export interface Destroy extends Extractor.Destroy.PendingResponse {}
	}
}
