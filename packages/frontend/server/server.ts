// include other main deps
import express from "express";
import compression from "compression";
import path from "path";
import cors from "cors";

// instantiate express
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// serve the static frontend files
app.use(express.static(`${__dirname}/../build`));

// Since we are using a single page app (aka using React) we need to make it send the index.html file only.
app.get("/*", (_, res) =>
	res.sendFile(path.resolve(__dirname, "..", "build/index.html"))
);

export const listen = () =>
	new Promise<number>((resolve) => {
		const port: number = parseInt(process.env.PORT ?? "3330");
		app.listen(port, () => {
			console.log(`Client app listening on :${port}`);
			resolve(port);
		});
	});
