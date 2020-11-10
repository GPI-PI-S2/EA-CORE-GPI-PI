import { container } from 'tsyringe';
import LoggerInstance from './logger';

export default async () => {
	container.register('logger', { useValue: LoggerInstance });
	return;
};
