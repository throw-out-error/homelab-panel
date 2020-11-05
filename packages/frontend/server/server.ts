// include other main deps
import express from "express";
import compression from "compression";

// instantiate express
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// static serving from /dist/client
app.use(express.static(`${__dirname}/dist`));

export const listen = () =>
	new Promise<number>((resolve) => {
		const port: number = parseInt(process.env.PORT ?? "3330");
		app.listen(port, () => {
			console.log(`Client app listening on :${port}`);
			resolve(port);
		});
	});
