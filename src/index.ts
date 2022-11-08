
import app, { attachOpenAPI, errorHandler } from './server';
import getClient from './database';

const PORT = process.env.PORT || 1337;

getClient().connect().then(async () => {
	console.log('Connected successfully to server');

	await attachOpenAPI(app);

	app.use(errorHandler);

	app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
}).catch(console.error)