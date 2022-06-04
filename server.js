import 'dotenv/config';
import express from 'express';


const PORT = process.env.PORT || 1337;

const app = express();

app.get('/', (request, response) => {
	response.send('Hello, World!');
});

app.get('/secret', (request, response) => {
	response.send(process.env.SECRET);
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
