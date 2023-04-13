require("dotenv").config();

const express = require("express");
const app = express();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2022-08-01",
});
app.get("/", (req, res) => {
	res.send("Server Running");
});

app.get("/config", (req, res) => {
	res.send({
		publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
	});
});

app.post("/create-payment-intent", async (req, res) => {
	try {

		const paymentIntent = await stripe.paymentIntents.create({
			currency: "inr",
			amount: 1999,
			 payment_method_types: ['card'],
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
