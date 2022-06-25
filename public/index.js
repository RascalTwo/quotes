new class ShowAutocompletes {
	constructor(showInput, seasonInput, seasonList, episodesList) {
		this.seasonList = seasonList
		this.episodesList = episodesList

		this.shows = {};
		this.showName = showInput.value;

		showInput.addEventListener('change', this.onShowInputChange.bind(this))
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
		return fetch(`/api/show-info?show=${encodeURIComponent(this.showName)}`)
			.then(r => r.json())
			.then(info => this.shows[this.showName] = info)
	}

	onShowInputChange({ currentTarget: { value: rawValue } }, showName = rawValue.trim()) {
		this.showName = showName;
		if (!this.showName) return;

		return (
			this.showName in this.shows ? Promise.resolve() : this.populateShowInfo()
		).then(() => this.renderDatalist(this.seasonList, Object.keys(this.shows[this.showName])));
	}

	async onSeasonInputChange({ currentTarget: { value: rawValue } }, season = rawValue.trim()) {
		if (!(this.showName in this.shows)) await this.populateShowInfo()

		if (season) this.renderDatalist(this.episodesList, this.shows[this.showName]?.[season] || []);
	}
}(showInput, seasonInput, seasonList, episodesList);

const IDENTIFIER_KEYS = ['show', 'season', 'episodes', 'timeStamp'];

function handleRelativeQuoteClick(relative, { currentTarget: button }) {
	button.disabled = true;

	const li = button.parentElement;
	const quote = {
		show: li.dataset.show,
		season: +li.dataset.season,
		episodes: JSON.parse(li.dataset.episodes),
		timeStamp: +li.dataset.timestamp
	}
	const url = new URL('/api/' + relative, window.location.origin);
	for (const key of IDENTIFIER_KEYS) url.searchParams.set(key, quote[key]);

	return fetch(url.toString()).then(r => r.json()).then(({ quote }) => {
		if (quote === null) return

		const alreadyExists = document.querySelector(`[data-show="${quote.show}"][data-season="${quote.season}"][data-episodes="${JSON.stringify(quote.episodes)}"][data-timestamp="${quote.timeStamp}"]`);
		if (alreadyExists) {
			return alreadyExists.querySelector(`.${relative === 'previous' ? 'next' : 'previous'}-button`).disabled = true;
		}

		const newLI = document.createElement('li')
		newLI.className = 'quote-item'
		newLI.dataset.show = quote.show;
		newLI.dataset.season = quote.season;
		newLI.dataset.timestamp = quote.timeStamp;
		newLI.dataset.episodes = JSON.stringify(quote.episodes);

		newLI.innerHTML = `
			<button class="previous-button" aria-label="Show Previous Quote" ${relative === 'next' ? 'disabled' : ''} ><</button>
			<code class="identifier">
				S${quote.season} E${quote.episodes.join('-')} at ${new Date(quote.timeStamp * 1000).toISOString().substr(11, 8)}
			</code>
			<button class="next-button" aria-label="Show Next Quote" ${relative === 'previous' ? 'disabled' : ''}>></button>
			<div class="text">${quote.text.replace(new RegExp('(' + [...document.querySelector('#original-query').value].map(char => `[${char}]`).join('') + ')', 'ig'), '<b>$1</b>')}</div>
		`;
		newLI.querySelectorAll('button').forEach(button =>
			button.addEventListener('click', handleRelativeQuoteClick.bind(null, button.className.split('-')[0]))
		);

		li.parentElement.insertBefore(newLI, relative === 'previous' ? li : li.nextElementSibling);
	});
}

document.querySelectorAll('ul button').forEach(button =>
	button.addEventListener('click', handleRelativeQuoteClick.bind(null, button.className.split('-')[0]))
);

document.querySelector('code a').textContent = window.location.origin + document.querySelector('code a').textContent