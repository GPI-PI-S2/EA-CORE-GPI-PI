import { Emol } from "./modules/Emol";
import { Extractor } from "./modules/Extractor";
import { Reddit } from "./modules/Reddit";
import { Telegram } from "./modules/Telegram";
import { Twitter } from "./modules/Twitter";
import { Youtube } from "./modules/Youtube";

export const extractors: Extractor[] = [new Telegram(), new Emol(), new Reddit(), new Twitter(), new Youtube()];
