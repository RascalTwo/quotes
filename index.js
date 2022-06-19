
import app, { attachOpenAPI, errorHandler } from './server.js';
import getClient from './database.js';

const PORT = process.env.PORT || 1337;

getClient().connect().then(async () => {
	console.log('Connected successfully to server');

	await attachOpenAPI(app);

	app.use(errorHandler);

	app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
}).catch(console.error)