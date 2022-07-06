# [Media Quotes API](https://r2-quotes.herokuapp.com)

[![OpenAPI Valid](https://validator.swagger.io/validator?url=https://r2-quotes.herokuapp.com/api-docs.json)](https://r2-quotes.herokuapp.com/api-docs.json)
[![Website](https://img.shields.io/website?url=https://r2-quotes.herokuapp.com&label=Website)](https://r2-quotes.herokuapp.com)

Return when things were said in your favorite media!

Defined as an [OpenAPI](https://r2-quotes.herokuapp.com/api-docs.json), for easy documentation via [Swagger UI](https://r2-quotes.herokuapp.com/api-docs/) and usage with [various tools](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/).

**Link to project:** https://r2-quotes.herokuapp.com

![search for "Sometimes I'll" showing one quote from Friends and two from The Office](https://user-images.githubusercontent.com/9403665/177627276-2b2beaf2-b269-4933-9657-1215fff7612a.png)

## Examples

> https://r2-quotes.herokuapp.com/api/search?query=Sometimes%20I'll&title=The%20Office&season=5&episodes=11&page=1&includeCounts=true&perPage=100

```json
{
  "quotes": [{
    "timeStamp": 694.11,
    "text": "Sometimes I'll start a sentence and I don't even know where it's going.",
    "media": {
      "title": "The Office",
      "season": 5,
      "episode": "11"
    }
  }],
  "counts": {
    "total": 1,
    "page": 1
  }
}
```

## How It's Made

**Tech used:** HTML, CSS, JavaScript, [Express](https://expressjs.com/), [Node.js](https://nodejs.org/en/), [OpenAPI](https://oai.github.io/Documentation/specification.html), [EJS](https://ejs.co/), [Mocha](https://mochajs.org/), [C8](https://www.npmjs.com/package/c8), [MongoDB](https://www.mongodb.com/docs/drivers/node/current/), [Playwright](https://playwright.dev/)

Powered by captions of your favorite TV Shows & Movies, uploaded into the database in an easily searchable manner, exposed both as a basic [EJS](https://ejs.co/) frontend allowing for the searching of media quotes by query, title, and media fields.

Exposed as an OpenAPI via [`express-openapi`](https://www.npmjs.com/package/express-openapi) with a Swagger UI via [`swagger-ui-express`](https://www.npmjs.com/package/swagger-ui-express), allowing for easy usage and experimentation.

With a near 100% test coverage provided by [`mocha`](https://mochajs.org/), [`c8`](https://www.npmjs.com/package/c8), and frontend coverage via [`playwright`](https://playwright.dev/).

### Deployment

Combining [GitHub Actions](https://github.com/RascalTwo/quotes/blob/main/.github/workflows/main.yml) with my tests and Heroku, the API is guaranteed to always be stable and working at all times.

## Optimizations

The API can additionally be exposed via GraphQL to be accessible to more developers, in addition there are a few MongoDB aggregation pipelines that can be rewritten more efficiently, but with the amount of current data the performance improvement would be negligible.
