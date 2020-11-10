import dependencyInjectorLoader from './dependencyInjector';
import Logger from './logger';
export default async () => {
	await dependencyInjectorLoader();
	Logger.verbose('✌️ Basic config loaded');
};
