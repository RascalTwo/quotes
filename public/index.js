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

	populateShowInfo(){
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