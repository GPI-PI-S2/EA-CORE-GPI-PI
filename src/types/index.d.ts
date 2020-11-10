declare module 'tweet-parser' {
	export type entityType = 'TEXT' | 'USER' | 'LINK' | 'HASH';
	export interface Entity<T extends entityType> {
		type: T;
		content: string;
	}
	export interface TextEntity extends Entity<'TEXT'> {}
	export interface UserEntity extends Entity<'USER'> {
		url: string;
	}
	export interface HashEntity extends Entity<'HASH'> {
		url: string;
	}
	export interface LinkEntity extends Entity<'LINK'> {
		url: string;
	}
	type entities = TextEntity | UserEntity | HashEntity | LinkEntity;
	export default function tweetParser(tweet: string): entities[];
}
