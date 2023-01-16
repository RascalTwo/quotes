import 'dotenv/config';
import { connectToDB, dropMediaFromDB } from './shared';


const [_, __, title] = process.argv;
if (!title) {
	console.error('title required');
	process.exit(1);
}

connectToDB()
	.then(({ client, db }) => dropMediaFromDB(db, title).finally(() => client.close()))
	.catch(console.error);
