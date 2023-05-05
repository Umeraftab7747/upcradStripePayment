require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2022-08-01",
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
	res.send("Server Running");
});

app.get("/config", (req, res) => {
	res.send({
		publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
	});
});
app.post("/imgeUpload", (req, res) => {
	cloudinary.v2.uploader
		.upload(req.body.img, {
			public_id: `${new Date().getTime()}`,
			background_removal: "cloudinary_ai",
			notification_url: "https://mysite.example.com/hooks",
		})
		.then((result) => {
			res.send({ data: result, msg: "done" });
		});
});
app.post("/create-payment-intent", async (req, res) => {
	try {
		const { priceit } = req.body;

		const paymentIntent = await stripe.paymentIntents.create({
			currency: "inr",
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
