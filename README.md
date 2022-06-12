# [Quotes API](https://r2-quotes.herokuapp.com)

[![Website](https://img.shields.io/website?url=https://r2-quotes.herokuapp.com&label=Website)](https://r2-quotes.herokuapp.com)

Return when things were said in your favorite media!

## Examples

> https://r2-quotes.herokuapp.com/api/search?query=Sometimes%20I'll&show=The%20Office&season=5&episodes=11page=1&includeCount=true&perPage=100

```json
{
  "quotes": [{
    "show": "The Office",
    "season": 5,
    "episodes": [ 11 ],
    "timeStamp": 694.11,
    "text": "Sometimes I'll start a sentence and I don't even know where it's going."
  }]
}
```