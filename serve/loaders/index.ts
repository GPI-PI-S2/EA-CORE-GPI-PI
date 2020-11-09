import dependencyInjectorLoader from './dependencyInjector';
import Logger from './logger';
export default async () => {
	await dependencyInjectorLoader();
	Logger.info('✌️ Basic config loaded');
};
