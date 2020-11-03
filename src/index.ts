import { Emol } from "./modules/Emol";
import { Extractor } from "./modules/Extractor";
import { Reddit } from "./modules/Reddit";
import { Telegram } from "./modules/Telegram";
<<<<<<< HEAD
import { Youtube } from './modules/Youtube'

export const extractors: Extractor[] = [new Telegram(), new Youtube()];
=======
import { Twitter } from "./modules/Twitter";
import { Youtube } from "./modules/Youtube";

export const extractors: Extractor[] = [new Telegram(), new Emol(), new Reddit(), new Twitter(), new Youtube()];
>>>>>>> 29b76dbb9610e07f78eaafdb341bbeccd0964397
