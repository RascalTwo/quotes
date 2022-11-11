import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { combineDestructors, generateQuoteID } from './helpers';
import { useOpenAPIService, useSearchState } from './hooks';

import './App.css';

import type React from 'react';
import type { DefaultService, MediaTitle } from './openapi';
import type { StateQuote, MediaInfo } from './types';
import Quote from './components/Quote';

function App() {
  const { loading, error, setError, service, makeRequest } = useOpenAPIService();

  const [mediaTitles, setMediaTitles] = useState<MediaTitle[]>([]);

  const [query, setQuery] = useSearchState('', 'query');
  const [queryTitle, setQueryTitle] = useSearchState('', 'title');
  const [querySeason, setQuerySeason] = useSearchState('', 'season');
  const [queryEpisode, setQueryEpisode] = useSearchState('', 'episode');
  const [queryPage, setQueryPage] = useSearchState(
    '1',
    'page',
    useCallback((value: string) => value === '1', []),
  );
  const [queryValid, setQueryValid] = useState(true);
  const [seasonAndEpisodeEnabled, setSeasonAndEpisodeEnabled] = useState(true);

  const [quotes, setQuotes] = useState<StateQuote[]>([]);
  const [counts, setCounts] = useState<{ total: number; page: number }>({ total: 0, page: 0 });

  const [mediaInfos, setMediaInfos] = useState<Record<MediaTitle, MediaInfo>>(
    {} as unknown as Record<MediaTitle, MediaInfo>,
  );
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | undefined>();
  const [relativeURL, setRelativeURL] = useState('');
  const [deployInfo, setDeployInfo] = useState('');

  useEffect(
    () =>
      combineDestructors(
        makeRequest(service.titles(), titles => {
          setMediaTitles(titles);
          return searchQuery();
        }),
        makeRequest(service.status(), status => setDeployInfo(status.deployed)),
      ),
    [],
  );

  useEffect(() => {
    const title = mediaTitles.find(title => title.toLowerCase() === queryTitle.toLowerCase());
    if (!title) return;

    return makeRequest(service.mediaInfo({ title }), info => {
      setMediaInfo(info.seasons);
      setMediaInfos(mediaInfos => ({ ...mediaInfos, [title]: info.seasons }));
    });
  }, [queryTitle, mediaTitles]);

  useEffect(() => {
    if (!queryTitle) return setQueryValid(true);
    const validQueryTitle = mediaTitles.some(title => title.toLowerCase().includes(queryTitle.toLowerCase()));
    setQueryValid(validQueryTitle);

    if (!validQueryTitle) setError(`Query Title "${queryTitle}" matches no media titles`);
    else if (error instanceof String && error.startsWith('Query Title')) setError(null);
  }, [queryTitle, setQueryValid]);

  useEffect(() => {
    const possibleTitles = mediaTitles.filter(title => title.toLowerCase().includes(queryTitle.toLowerCase()));
    const areAllMovies = possibleTitles.every(
      title => title in mediaInfos && Object.keys(mediaInfos[title]).length === 0,
    );
    setSeasonAndEpisodeEnabled(!areAllMovies);
  }, [queryTitle, mediaInfos, setSeasonAndEpisodeEnabled]);

  const getRelativeQuote = (quote: StateQuote, direction: 'previous' | 'next') => {
    const method = (direction === 'previous' ? service.previousQuote : service.nextQuote).bind(service);
    method({
      title: quote.media.title,
      season: quote.media.season,
      episode: quote.media.episode,
      timeStamp: quote.timeStamp,
    }).then(({ quote: rawNewQuote }) => {
      if (!rawNewQuote) return;
      setQuotes(quotes => {
        const quoteIndex = quotes.findIndex(loopQuote => loopQuote.id === quote.id);

        const newQuotes = [...quotes];
        // set direction of clicked button to false
        newQuotes[quoteIndex] = { ...quote, relativeAvailable: { ...quote.relativeAvailable, [direction]: false } };

        const newQuote: StateQuote = {
          ...rawNewQuote,
          id: generateQuoteID(rawNewQuote),
          // @ts-ignore as TS doesn't realize both directions are provided
          relativeAvailable: {
            [direction === 'previous' ? 'next' : 'previous']: false,
            [direction]: true,
          },
        };
        const newQuoteExistingIndex = newQuotes.findIndex(loopQuote => loopQuote.id === newQuote.id);
        if (newQuoteExistingIndex === -1) newQuotes.splice(quoteIndex + +(direction === 'next'), 0, newQuote);
        else {
          newQuote.relativeAvailable[direction] = newQuotes[newQuoteExistingIndex].relativeAvailable[direction];
          newQuotes[newQuoteExistingIndex] = newQuote;
        }

        (async () => {
          while (true) {
            await new Promise(resolve => setTimeout(resolve, 10));
            const button = document.querySelector<HTMLButtonElement>(
              `li[data-qid="${newQuote.id}"] .${direction}-button`,
            );
            if (button) return button.focus();
          }
        })();

        return newQuotes;
      });
    });
  };

  const searchQuery = useCallback(() => {
    if (!queryValid) return;

    const params: Parameters<DefaultService['search']>[0] = { query };
    if (queryTitle) params.title = queryTitle as MediaTitle;
    if (queryEpisode) params.episode = queryEpisode;
    if (querySeason && !isNaN(+querySeason)) params.season = +querySeason;
    if (queryPage !== '1') params.page = +queryPage;

    setRelativeURL('/search?' + new URLSearchParams(params as unknown as Record<string, string>).toString());

    makeRequest(service.search({ ...params, includeCounts: true }), ({ quotes, counts }) => {
      setQuotes(
        quotes.map(quote => ({
          ...quote,
          id: generateQuoteID(quote),
          relativeAvailable: { next: true, previous: true },
        })),
      );
      if (counts) setCounts(counts);
    });
  }, [query, queryTitle, queryEpisode, querySeason, queryPage, queryValid, setRelativeURL, setQuotes, setCounts]);

  const handleQuerySearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      searchQuery();
    },
    [searchQuery],
  );

  return (
    <>
      <a className="view-link" href="/ejs">Switch to EJS</a>
      <h1>Media Quotes API</h1>
      <form onSubmit={handleQuerySearch}>
        <fieldset disabled={loading}>
          <legend>Controls</legend>

          <label htmlFor="queryInput">Query</label>
          <input
            id="queryInput"
            name="query"
            required
            value={query}
            onChange={useCallback(
              (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.currentTarget.value),
              [setQuery],
            )}
          />

          <label htmlFor="mediaTitleInput">Title</label>
          <input
            id="mediaTitleInput"
            name="title"
            list="mediaTitles"
            autoComplete="off"
            value={queryTitle}
            onChange={useCallback(
              (e: React.ChangeEvent<HTMLInputElement>) => setQueryTitle(e.currentTarget.value),
              [setQueryTitle],
            )}
          />
          <datalist id="mediaTitles">
            {useMemo(() => mediaTitles.map(title => <option key={title} value={title} />), [mediaTitles])}
          </datalist>

          <label htmlFor="seasonInput">Season #</label>
          <input
            id="seasonInput"
            name="season"
            list="seasonList"
            autoComplete="off"
            min="1"
            type="number"
            disabled={!seasonAndEpisodeEnabled}
            value={querySeason}
            onChange={useCallback(
              (e: React.ChangeEvent<HTMLInputElement>) => setQuerySeason(e.currentTarget.value),
              [setQuerySeason],
            )}
          />
          <datalist id="seasonList">
            {useMemo(
              () => (mediaInfo ? Object.keys(mediaInfo).map(season => <option key={season} value={season} />) : null),
              [mediaInfo],
            )}
          </datalist>

          <label htmlFor="episodesInput">Episode</label>
          <input
            id="episodesInput"
            name="episodes"
            list="episodesList"
            autoComplete="off"
            min="1"
            disabled={!seasonAndEpisodeEnabled}
            value={queryEpisode}
            onChange={useCallback(
              (e: React.ChangeEvent<HTMLInputElement>) => setQueryEpisode(e.currentTarget.value),
              [setQueryEpisode],
            )}
          />
          <datalist id="episodesList">
            {useMemo(
              () =>
                mediaInfo
                  ? (mediaInfo[querySeason] || []).map(episodes => <option key={episodes} value={episodes} />)
                  : null,
              [mediaInfo, querySeason],
            )}
          </datalist>

          <label htmlFor="pageInput">Page</label>
          <input
            id="pageInput"
            name="page"
            min="1"
            type="number"
            value={queryPage}
            onChange={useCallback(
              (e: React.ChangeEvent<HTMLInputElement>) => setQueryPage(e.currentTarget.value),
              [setQueryPage],
            )}
            max={useMemo(() => Math.max(counts.page, 1), [counts.page])}
          />

          <button disabled={!queryValid}>Submit</button>
          <button
            type="reset"
            onClick={useCallback(() => {
              setQuery('');
              setQueryTitle('');
              setQuerySeason('');
              setQueryEpisode('');
              setQueryPage('1');
              setQuotes([]);
              setCounts({ total: 0, page: 0 });
              setRelativeURL('');
            }, [
              setQuery,
              setQueryTitle,
              setQuerySeason,
              setQueryEpisode,
              setQueryPage,
              setQuotes,
              setCounts,
              setRelativeURL,
            ])}
          >
            Reset
          </button>
        </fieldset>
      </form>
      {error ? <p>{error.message || error.toString()}</p> : null}
      <p>{counts.total ? counts.total : 'No'} quotes found</p>
      <ul>
        {
          quotes.reduce(
            ({ title, elements }, quote) => {
              if (title.toLowerCase() !== quote.media!.title.toLowerCase()) {
                title = quote.media!.title;
                elements.push(
                  <li key={title} className="media-title">
                    {title}
                  </li>,
                );
              }
              return {
                title,
                elements: [
                  ...elements,
                  <Quote key={quote.id} quote={quote} query={query} getRelativeQuote={getRelativeQuote} />,
                ],
              };
            },
            { title: '', elements: [] as ReactNode[] },
          ).elements
        }
      </ul>
      <footer>
        <h2>API</h2>
        <ul>
          <li>
            <a href="/api-docs/">Swagger UI</a>
          </li>
          <li>
            <a href="/api-docs.json">OpenAPI JSON</a>
          </li>
        </ul>
        <p>
          Current query API Endpoint:
          <br />
          <code>
            <a href={`/api${relativeURL}`}>/api{relativeURL}</a>
          </code>
        </p>
        <br />
        <pre>Deployed Version: {deployInfo}</pre>
      </footer>
    </>
  );
}

export default App;
