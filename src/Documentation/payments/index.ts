import { responses } from "../responses";

const payment = {
	payments: {
		tags: ["Payments"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "Payment using stripe or momoPay",
		parameters: [
			{
				in: "query",
				name: "method",
				required: true,
				schema: {
					type: "string",
				},
			},
		],
		requestBody: {
			required: true,
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							phoneNumber: {
								type: "string",
								description: "enter phone number",
								required: true,
								example: "0783570512",
							},
						},
					},
				},
			},
		},
		responses,
	},
};

export const app_payments = {
	"/api/v1/payments": {
		post: payment["payments"],
	},
};
