new class MediaAutocompletes {
	constructor(mediaTitleInput, seasonInput, seasonList, episodesList) {
		this.seasonList = seasonList
		this.episodesList = episodesList

		this.media = {};
		this.mediaTitle = mediaTitleInput.value;

		mediaTitleInput.addEventListener('change', this.onMovieTitleInputChange.bind(this))
		seasonInput.addEventListener('change', this.onSeasonInputChange.bind(this))
	}

	renderDatalist(datalist, values) {
		datalist.innerHTML = '';
		datalist.appendChild(values.reduce((fragment, value) => {
			const option = document.createElement('option');
			option.textContent = value;
			fragment.appendChild(option);
			return fragment;
		}, document.createDocumentFragment()));
	}

	populateShowInfo() {
		return fetch(`/api/media-info?title=${encodeURIComponent(this.mediaTitle)}`)
			.then(r => r.json())
			.then(({ seasons }) => this.media[this.mediaTitle] = seasons || {})
	}

	onMovieTitleInputChange({ currentTarget: { value: rawValue } }, mediaTitle = rawValue.trim()) {
		this.mediaTitle = mediaTitle;
		if (!this.mediaTitle) return;

		return (
			this.mediaTitle in this.media ? Promise.resolve() : this.populateShowInfo()
		).then(() => this.renderDatalist(this.seasonList, Object.keys(this.media[this.mediaTitle])));
	}

	async onSeasonInputChange({ currentTarget: { value: rawValue } }, season = rawValue.trim()) {
		if (!(this.mediaTitle in this.media)) await this.populateShowInfo()

		if (season) this.renderDatalist(this.episodesList, this.media[this.mediaTitle]?.[season] || []);
	}
}(mediaTitleInput, seasonInput, seasonList, episodesList);

const IDENTIFIER_KEYS = ['title', 'season', 'episode', 'timeStamp'];

function handleRelativeQuoteClick(relative, { currentTarget: button }) {
	button.disabled = true;

	const li = button.closest('li');
	const quote = {
		title: li.dataset.title,
		timeStamp: +li.dataset.timestamp
	}
	if (li.dataset.season) quote.season = +li.dataset.season;
	if (li.dataset.episode) quote.episode = li.dataset.episode;

	const url = new URL('/api/' + relative, window.location.origin);
	for (const key of IDENTIFIER_KEYS) if (key in quote) url.searchParams.set(key, quote[key]);

	return fetch(url.toString()).then(r => r.json()).then(({ quote }) => {
		if (quote === null) return

		const alreadyExists = document.querySelector(`[data-title="${quote.media.title}"][data-season="${quote.season}"][data-episode="${quote.episode}"][data-timestamp="${quote.timeStamp}"]`);
		if (alreadyExists) {
			return alreadyExists.querySelector(`.${relative === 'previous' ? 'next' : 'previous'}-button`).disabled = true;
		}

		const newLI = document.createElement('li')
		newLI.className = 'quote-item'
		newLI.dataset.title = quote.media.title;
		newLI.dataset.season = quote.media.season;
		newLI.dataset.episode = quote.media.episode;
		newLI.dataset.timestamp = quote.timeStamp;

		newLI.innerHTML = `
			<button class="previous-button" aria-label="Show Previous Quote" ${relative === 'next' ? 'disabled' : ''} ><</button>
			<code class="identifier">
				${quote.media.season ? `S${quote.media.season} E${quote.media.episode} at ` : ''}
				${new Date(quote.timeStamp * 1000).toISOString().substr(11, 8)}
			</code>
			<button class="next-button" aria-label="Show Next Quote" ${relative === 'previous' ? 'disabled' : ''}>></button>
			<div class="text">${quote.text.replace(new RegExp('(' + [...document.querySelector('#original-query').value].map(char => `[${char}]`).join('') + ')', 'ig'), '<b>$1</b>')}</div>
		`;
		newLI.querySelectorAll('button').forEach(button =>
			button.addEventListener('click', handleRelativeQuoteClick.bind(null, button.className.split('-')[0]))
		);

		li.parentElement.insertBefore(newLI, relative === 'previous' ? li : li.nextElementSibling);
		newLI.querySelector(`.${relative}-button`).focus();
	});
}

document.querySelectorAll('ul button').forEach(button =>
	button.addEventListener('click', handleRelativeQuoteClick.bind(null, button.className.split('-')[0]))
);

document.querySelector('code a').textContent = window.location.origin + document.querySelector('code a').textContent