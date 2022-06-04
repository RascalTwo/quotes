const express = require('express');


console.log('Hello, World!')

const app = express();

app.get('/', (request, response) => {
	response.send('Hello, World!');
})

app.listen(1337, () => console.log('Listening at http://localhost:1337'))
