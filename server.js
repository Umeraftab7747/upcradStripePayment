require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { removeBackgroundFromImageBase64 } = require("remove.bg");
const cors = require("cors");

const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2022-08-01",
});
app.use(cors({origin:"*"}));
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.get("/", (req, res) => {
	res.send("Server Running");
});

app.get("/config", (req, res) => {
	res.send({
		publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
	});
});
app.post("/imgeUpload", (req, res) => {
	const { imglink, starter } = req.body;

	let url = `${starter}${imglink}`;

	removeBackgroundFromImageBase64({
		base64img: url,
		apiKey: `${process.env.REMOVEAPI}`,
		size: "regular",
		type: "person",
	})
		.then((result) => {
			res.send({
				imglink: `data:image/png;base64,${result.base64img}`,
				error: "",
			});
		})
		.catch((errors) => {
			res.send({
				imglink: `data:image/png;base64,${imglink}`,
				error: errors,
			});
		});
});
app.post("/create-payment-intent", async (req, res) => {
	try {
		const { priceit } = req.body;
		const result = parseInt(priceit);
		let finalMain = result - priceit;
		const paymentIntent = await stripe.paymentIntents.create({
			currency: "EUR",
			amount: parseInt(priceit) * 100,
		});

		// Send publishable key and PaymentIntent details to client
		res.json({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (e) {
		return res.status(400).send({
			error: {
				message: e.message,
			},
		});
	}
});
const ports = process.env.PORT || 4000;
app.listen(ports, () =>
	console.log(`Node server listening at http://localhost:${ports}`)
);
