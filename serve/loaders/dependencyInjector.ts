import { container } from 'tsyringe';
import LoggerInstance from './logger';

export default async () => {
	//	Container.set('logger', LoggerInstance);
	container.register('logger', { useValue: LoggerInstance });
	return;
};
