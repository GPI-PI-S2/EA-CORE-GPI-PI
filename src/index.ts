import { Extractor } from "./modules/Extractor";
import { Telegram } from "./modules/Telegram";
import { Youtube } from './modules/Youtube'

export const extractors: Extractor[] = [new Telegram(), new Youtube()];
