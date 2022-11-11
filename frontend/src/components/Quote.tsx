import { useMemo } from 'react';
import { StateQuote } from '../types';

interface QuoteProps {
  quote: StateQuote;
  query: string;
  getRelativeQuote: (quote: StateQuote, direction: 'previous' | 'next') => void;
}

export default function Quote({ quote, query, getRelativeQuote }: QuoteProps) {
  return (
    <li data-qid={quote.id} className="quote-item">
      <button
        className="previous-button"
        aria-label="Show Previous Quote"
        disabled={!quote.relativeAvailable.previous}
        onClick={getRelativeQuote.bind(null, quote, 'previous')}
      >
        {'<'}
      </button>
      <code className="identifier">
        {useMemo(
          () =>
            quote.media.season ? (
              <>
                S{quote.media.season} E{quote.media.episode} at &nbsp;
              </>
            ) : null,
          [quote.media.season, quote.media.episode],
        )}
        {useMemo(() => new Date(quote.timeStamp * 1000).toISOString().substr(11, 8), [quote.timeStamp])}
      </code>
      <button
        className="next-button"
        aria-label="Show Next Quote"
        disabled={!quote.relativeAvailable.next}
        onClick={getRelativeQuote.bind(null, quote, 'next')}
      >
        {'>'}
      </button>

      <div
        className="text"
        dangerouslySetInnerHTML={useMemo(
          () => ({
            __html: quote.text.replace(
              new RegExp(`(${[...query].map(char => `[${char}]`).join('')})`, 'ig'),
              '<b>$1</b>',
            ),
          }),
          [quote.text, query],
        )}
      ></div>
    </li>
  );
}
