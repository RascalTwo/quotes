import 'dotenv/config';
import { MongoClient } from 'mongodb'
import express from 'express';


const PORT = process.env.PORT || 1337;
const MONGODB_URL = process.env.MONGODB_URL;

const app = express();

app.get('/', (request, response) => {
	response.send('Hello, World!');
});

app.get('/secret', (request, response) => {
	response.send(process.env.SECRET);
});


if (!MONGODB_URL) throw new Error('MONGODB_URL environment variable required.')

const client = new MongoClient(process.env.MONGODB_URL);
client.connect().then(client => {
  console.log('Connected successfully to server');

	app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
}).catch(console.error)
