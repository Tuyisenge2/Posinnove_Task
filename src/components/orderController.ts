import { Request, Response } from "express";
import { Order } from "../database/models/order";
import { Product } from "../database/models/product";
import { Sales } from "../database/models/sales";
import { ExpandedRequest } from "../middlewares/auth";
import { sendResponse } from "../utils/http.exception";

const include = [
	{
		model: Sales,
		as: "sales",
		attributes: {
			exclude: ["createdAt", "updatedAt", "orderId", "buyerId"],
		},
		include: [
			{
				model: Product,
				as: "soldProducts",
				attributes: ["name", "images", "price", "discount"],
			},
		],
	},
];

const getOrders = async (req: Request, res: Response) => {
	try {
		const user = (req as unknown as ExpandedRequest).user;
		const userId = user?.id;

		const orders = await Order.findAll({
			where: { buyerId: userId },
			include,
		});

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Orders retrieved successfully",
			orders,
		);
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

const getSingleOrder = async (req: Request, res: Response) => {
	try {
		const user = (req as unknown as ExpandedRequest).user;
		const userId = user?.id;

		const { id } = req.params;

		const order = await Order.findOne({
			where: { id, buyerId: userId },
			include,
		});

		if (!order) {
			return sendResponse(res, 404, "NOT FOUND", "Order not found");
		}

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Order retrieved Successfully!",
			order,
		);
	} catch (error) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something went Wrong!",
			(error as Error).message,
		);
	}
};

export default { getOrders, getSingleOrder };
