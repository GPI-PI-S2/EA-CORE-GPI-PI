import Axios, { AxiosInstance } from 'axios';
import Joi from 'joi';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { Anal } from '../../Analyzer';
import { Extractor } from '../Extractor';
import { Response } from '../Extractor/Response';
@injectable()
export class Youtube extends Extractor {
	protected static deployConfigSchema = Extractor.deployConfigSchema.append({
		apiKey: Joi.string().max(100).required(),
	});
	constructor(@inject('logger') private logger: Logger) {
		super({
			id: 'youtube-extractor', // Identificador, solo letras minúsculas y guiones (az-)
			name: 'Youtube', // Nombre legible para humanos
			version: '2.0.0',
		});
	}
	private api: AxiosInstance; // En caso de instanciar desde deploy remover readonly
	async deploy(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		config: Youtube.Deploy.Config,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		options?: Youtube.Deploy.Options,
	): Promise<Response<null>> {
		this.logger.verbose(`DEPLOY ${this.register.id} v${this.register.version}`, {
			config,
			options,
		});

		const validConfig = Youtube.deployConfigSchema.validate(config);
		const validOptions = Youtube.deployOptionsSchema.validate(options);
		if (validConfig.error || validOptions.error)
			return new Response(this, Response.Status.ERROR, {
				configError: validConfig.error ? validConfig.error.message : undefined,
				optionsError: validOptions.error ? validOptions.error.message : undefined,
			} as never);

		const { apiKey } = config;
		this.api = Axios.create({
			baseURL: 'https://www.googleapis.com/youtube/v3/', // Base URL,
			responseType: 'json',
			params: { key: apiKey },
		});
		return new Response(this, Response.Status.OK);
	}
	async obtain(options: Youtube.Obtain.Options): Promise<Response<Anal.Analysis>> {
		this.logger.verbose(`OBTAIN ${this.register.id} v${this.register.version}`, options);

		const validOptions = Youtube.obtainOptionsSchema.validate(options);
		if (validOptions.error)
			return new Response(this, Response.Status.ERROR, {
				optionsError: validOptions.error ? validOptions.error.message : undefined,
			} as never);

		const { metaKey, limit, minSentenceSize } = options;
		let filtered: Anal.input[] = [];
		const anal = new Anal(this);
		const parentsWithSubCommentsIds: string[] = [];
		let tokenPage = '';
		// Repeticiones para mas comentarios
		try {
			while (tokenPage != undefined && filtered.length < limit) {
				this.logger.silly('pidiendo->', tokenPage);
				const response = await this.api.get<Youtube.CommentThreads>('commentThreads', {
					params: {
						videoId: metaKey,
						pageToken: tokenPage,
						maxResults: limit > 100 ? 100 : limit,
						textFormat: 'plainText',
						part: 'snippet,replies',
					},
				});
				this.logger.silly('recibido');
				let tempList: Anal.input[] = [];
				response.data.items.forEach((comment) => {
					const content = comment.snippet.topLevelComment.snippet.textDisplay;
					const totalRepliesCount = comment.snippet.totalReplyCount;
					if (comment.replies) {
						const replies = comment.replies.comments;
						if (replies.length === totalRepliesCount) {
							this.logger.debug(`Añadidas respuestas de ${comment.id}`);
							tempList = tempList.concat(
								replies.map((reply) => ({ content: reply.snippet.textDisplay })),
							);
						} else if (replies.length !== totalRepliesCount)
							parentsWithSubCommentsIds.push(comment.id);
					}
					tempList.push({ content });
				});
				filtered = filtered.concat(
					tempList
						.map((content) => Anal.htmlParse(content))
						.filter((comment) =>
							Anal.filter(comment, { minSentenceSize, assurance: 0.25 }),
						),
				);
				tokenPage = response.data.nextPageToken;
				this.logger.info(`Comentarios actualmente escaneados: ${filtered.length}`);
				if (filtered.length > limit) {
					break;
				}
			}
			for (
				let x = 0;
				parentsWithSubCommentsIds.length > 0 &&
				x < parentsWithSubCommentsIds.length &&
				filtered.length < limit;
				x++
			) {
				try {
					let token = '';
					const parentId = parentsWithSubCommentsIds[x];
					while (token != undefined && filtered.length < limit) {
						const response = await this.api.get<Youtube.Comments>('comments', {
							params: {
								id: parentId,
								part: 'snippet',
								maxResults: 100,
							},
						});
						const comments = response.data.items.map((item) => ({
							content: item.snippet.textDisplay,
						}));
						filtered = filtered.concat(
							comments
								.map((content) => Anal.htmlParse(content))
								.filter((comment) =>
									Anal.filter(comment, { minSentenceSize, assurance: 0.25 }),
								),
						);
						token = response.data.nextPageToken;
						this.logger.info(
							`(Respuestas) Comentarios actualmente escaneados: ${filtered.length}`,
						);
					}
				} catch (error) {
					this.logger.error(error);
				}
			}
			filtered = filtered.slice(0, limit);
			this.logger.silly(`length: ${filtered.length}`);
			const analysis = await anal.analyze(filtered, { metaKey });
			return new Response<Anal.Analysis>(this, Response.Status.OK, analysis);
		} catch (error) {
			this.logger.debug(`OBTAIN error ${this.register.id} v${this.register.version}`, error);
			return new Response<Anal.Analysis>(this, Response.Status.ERROR, null, error);
		}
	}
	async unitaryObtain(options: Youtube.UnitaryObtain.Options): Promise<Response<unknown>> {
		const { metaKey, apiKey, limitComment } = options;
		const comments: Anal.input[] = [];
		const anal = new Anal(this);
		this.logger.verbose('UNITARY OBTAIN', options);
		try {
			const response = await this.api.get<Youtube.Comments>('comments', {
				params: {
					key: apiKey,
					id: metaKey, // commentId
					part: 'snippet',
				},
			});
			let tokenPage = '';
			const commentOriginal = {
				content: response.data.items[0].snippet.textDisplay,
			};
			comments.push(commentOriginal);

			// has replies?
			if (limitComment != undefined) {
				while (tokenPage != undefined) {
					const response2 = await this.api.get<Youtube.Comments>('comments', {
						params: {
							key: apiKey,
							parentId: metaKey,
							part: 'snippet',
							maxResults: 100,
							pageToken: tokenPage,
						},
					});
					tokenPage = response.data.nextPageToken;
					response2.data.items.map((comment) =>
						comments.push({ content: comment.snippet.textOriginal }),
					);
					this.logger.silly('Comentario:', response2.data.items[0].snippet.textDisplay);
					this.logger.silly(`Respuestas actualmente escaneadas: ${comments.length}`);
					if (comments.length > limitComment) {
						break;
					}
				}
			}
			/* Parseando los datos a la estructura del analyzer */
			const message: Anal.input[] = comments.map((eachComment) => ({
				content: eachComment.content,
			}));
			const analysis = await anal.analyze(message, { metaKey });
			this.logger.silly(message);
			return new Response(this, Response.Status.OK, analysis);
		} catch (error) {
			this.logger.debug('UNITARY OBTAIN', error);
			return new Response<Anal.Analysis>(this, Response.Status.ERROR, null, error);
		}
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async destroy(options: Youtube.Destroy.Options): Promise<Response<null>> {
		return new Response(this, Response.Status.OK);
	}
}
export namespace Youtube {
	interface Resource<K extends string> {
		kind: K;
		etag: string;
	}
	export interface Comment extends Resource<'youtube#comment'> {
		id: string;
		snippet: {
			authorDisplayName: string;
			authorProfileImageUrl: string;
			authorChannelUrl: string;
			authorChannelId: {
				value: string;
			};
			channelId: string;
			videoId: string;
			textDisplay: string;
			textOriginal: string;
			parentId: string;
			canRate: boolean;
			viewerRating: string;
			likeCount: number;
			moderationStatus: string;
			publishedAt: string;
			updatedAt: string;
		};
	}
	export interface CommentThread extends Resource<'youtube#commentThread'> {
		id: string;
		snippet: {
			chanelId: string;
			videoId: string;
			topLevelComment: Comment;
			canReply: boolean;
			totalReplyCount: number;
			isPublic: boolean;
		};
		replies: {
			comments: Comment[];
		};
	}
	export interface CommentThreads extends Resource<'youtube#commentThreadListResponse'> {
		nextPageToken: string;
		pageInfo: {
			totalResults: number;
			resultsPerPage: number;
		};
		items: CommentThread[];
	}
	export interface Comments extends Resource<'youtube#commentListResponse'> {
		nextPageToken: string;
		pageInfo: {
			totalResults: number;
			resultsPerPage: number;
		};
		items: Comment[];
	}
	export namespace Deploy {
		export interface Config extends Extractor.Deploy.Config {
			apiKey: string;
		}
		export interface Options extends Extractor.Deploy.Options {}
		export interface Response extends Extractor.Deploy.Response {}
	}
	export namespace Obtain {
		export interface Options extends Extractor.Obtain.Options {}
		export interface Response extends Extractor.Obtain.Response {}
	}
	export namespace UnitaryObtain {
		export interface Options extends Extractor.UnitaryObtain.Options {
			apiKey: string;
			limitComment: number;
		}
		export interface Response extends Extractor.UnitaryObtain.Response {}
	}
	export namespace Destroy {
		export interface Options extends Extractor.Destroy.Options {}
		export interface Response extends Extractor.Destroy.Response {}
	}
}
