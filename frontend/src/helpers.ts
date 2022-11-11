import type { Quote } from './openapi';

export const combineDestructors =
  (...destructors: (() => void)[]) =>
  () => {
    for (const destructor of destructors) destructor();
  };

export const generateQuoteID = (quote: Quote) =>
  [quote.media.title, quote.media.season, quote.media.episode, quote.timeStamp]
    .filter(value => value !== undefined)
    .join('-');
