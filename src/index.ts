import { Extractor } from "./modules/Extractor";
import { Telegram } from "./modules/Telegram";

export const extractors: Extractor[] = [new Telegram()];
