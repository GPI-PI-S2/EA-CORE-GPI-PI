import { Extractor } from "./modules/Extractor";
import { Telegram } from "./modules/Telegram";
import { Emol } from './modules/Emol'

export const extractors: Extractor[] = [new Telegram(), new Emol()];
