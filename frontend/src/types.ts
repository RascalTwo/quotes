import type { EpisodeNumber, Quote } from "./openapi";


export type MediaInfo = Record<string, Array<EpisodeNumber>>;

export interface StateQuote extends Quote {
  id: string;
  relativeAvailable: { next: boolean; previous: boolean };
}