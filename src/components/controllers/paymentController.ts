import axios from "axios";
import { Request, Response } from "express";
import Stripe from "stripe";
import database_models from "../database/config/db.config";
import { ExpandedRequest } from "../middlewares/auth";
import cartService from "../services/carts.services";
import {
	getOrCreateStripeCustomer,
	getPaymentBySession,
	lineCartItems,
	orderItems,
	readOrderById,
	recordPaymentDetails,
} from "../services/payment.services";
import {
	PaymentsModelAttributes,
	UserModelAttributes,
	cartModelAttributes,
} from "../types/model";
import {
	CartRequest,
	MomoInfo,
	PaymentDetails,
	TransactionRequest,
} from "../types/payment";
import { insert_function, read_function } from "../utils/db_methods";
import { sendResponse } from "../utils/http.exception";
import {
	BASE_URL,
	MTN_MOMO_REQUEST_PAYMENT_URL,
	MTN_MOMO_SUBSCRIPTION_KEY,
	MTN_MOMO_TARGET_ENVIRONMENT,
} from "../utils/keys";
import { getToken } from "../utils/momoMethods";
import { findUserById } from "../services/user.services";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: "2024-04-10",
});

export const create_checkout_session = async (req: Request, res: Response) => {
	try {
		if (req.query.method === "stripe") {
			const loggedUser = (req as ExpandedRequest).user;
			const condition = { where: { id: loggedUser?.id } };
			const user = await read_function<UserModelAttributes>(
				"User",
				"findOne",
				condition,
			);

			const cart = (req as CartRequest).cart;
			const line_items = lineCartItems(cart);
			const customer = await getOrCreateStripeCustomer(user);
			const session = await stripe.checkout.sessions.create({
				line_items,
				mode: "payment",
				payment_method_types: ["card"],
				billing_address_collection: "auto",
				customer: customer.id,
				success_url: `${BASE_URL}/payments/success?sessionId={CHECKOUT_SESSION_ID}&payerId=${user.id}`,
				cancel_url: `${BASE_URL}/api/v1/payments/cancel`,
			});
			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Checkout session created successfully!",
				{ sessionUrl: session.url as string },
			);
		} else {
			// *****************************************************************************
			// ********************************* MOMO **************************************
			// *****************************************************************************
			let order;
			const { cart } = req as CartRequest;

			const { XReferenceId } = (req as MomoInfo).momoInfo as {
				XReferenceId: string;
			};

			const url = `${MTN_MOMO_REQUEST_PAYMENT_URL}/${XReferenceId}`;
			const target = MTN_MOMO_TARGET_ENVIRONMENT;
			const subscriptionKey = MTN_MOMO_SUBSCRIPTION_KEY;
			const token = await getToken();

			const headers = {
				"X-Target-Environment": target,
				"Ocp-Apim-Subscription-Key": subscriptionKey,
				Authorization: `Bearer ${token}`,
			};

			const response = await axios.get(url, { headers });

			const transaction = response.data;

			const transactionExist = (req as TransactionRequest).transaction;
			const transactionData = (req as TransactionRequest).transactionData;
			// save payment info
			if (!transactionExist) {
				const userId = (req as ExpandedRequest).user?.id;
				await recordPaymentDetails({
					payerId: userId,
					paymentId: XReferenceId,
					paymentMethod: "momo",
					status: transaction.status,
					phoneNumber: req.body.phoneNumber,
				});
			}

			if (transaction.status === "SUCCESSFUL") {
				order = await orderItems(cart);
				if (transactionExist) {
					await insert_function<PaymentsModelAttributes>(
						"Payments",
						"update",
						{ status: transaction.status },
						{ where: { id: transactionExist.id } },
					);
				}
				await database_models.Cart.destroy({ where: { id: cart.id } });
			}

			return sendResponse(
				res,
				200,
				transaction.status,
				transaction.status === "SUCCESSFUL"
					? "Products are successfully paid and ordered!"
					: `Payment ${transaction.status}`,
				transaction.status === "SUCCESSFUL"
					? { order }
					: // : transactionExist || transaction.status === "PENDING"
						transaction.status === "PENDING"
						? transactionData
						: transaction.reason,
			);
		}
	} catch (error) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something went wrong!",
			(error as Error).message,
		);
	}
};

const checkout_success = async (req: Request, res: Response) => {
	try {
		let order;
		const { sessionId, payerId } = req.query as {
			sessionId: string;
			payerId: string;
		};
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		const paymentId = session.payment_intent as string;
		const cart = (await cartService.findCartByUserIdService(
			payerId,
		)) as cartModelAttributes;
		const user = await findUserById(payerId);
		if (!user || !user.email) {
			throw new Error("User email not found");
		}

		if (session.payment_status === "paid") {
			const sessionById: PaymentDetails = await getPaymentBySession(session.id);
			if (!sessionById) {
				order = await orderItems(cart);
				const paymentDetails: PaymentDetails = {
					payerId,
					paymentMethod: "stripe",
					paymentId,
					orderId: order.id,
					sessionId: session.id,
				};

				await recordPaymentDetails(paymentDetails);
			} else {
				order = await readOrderById(sessionById.orderId!);
			}

			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Products are successfully paid and ordered!",
				{ order },
			);
		}
	} catch (error) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something went wrong!",
			(error as Error).message,
		);
	}
};

const checkout_cancel = (_req: Request, res: Response) => {
	return sendResponse(res, 500, "SERVER ERROR", "Payment process error!");
};

export default {
	create_checkout_session,
	checkout_success,
	checkout_cancel,
};
