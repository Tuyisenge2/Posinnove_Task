import { Request, Response } from "express";
import { ExpandedRequest } from "../middlewares/auth";
import { sendResponse } from "../utils/http.exception";
import { updateOrderStatusMiddleware } from "../middlewares/orderStatus.middleware";
import { Product } from "../database/models/product";
import { Sales } from "../database/models/sales";

const allSales = async (req: Request, res: Response) => {
	try {
		const user = (req as unknown as ExpandedRequest).user;

		const userId = user?.id;

		const sales = await Sales.findAll({
			include: [
				{
					model: Product,
					as: "soldProducts",
					where: { sellerId: userId },
				},
			],
		});

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Sales retrieved successfully",
			sales,
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

const singleSale = async (req: Request, res: Response) => {
	try {
		const user = (req as unknown as ExpandedRequest).user;
		const userId = user?.id;

		const { id } = req.params;

		const sale = await Sales.findOne({
			where: { id },
			include: [
				{
					model: Product,
					as: "soldProducts",
					where: { sellerId: userId },
				},
			],
		});

		if (!sale) {
			return sendResponse(res, 404, "NOT FOUND", "Sale not found");
		}

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Sale retrieved successfully",
			sale,
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

const updateOrderStatus = async (req: Request, res: Response) => {
	try {
		const user = (req as unknown as ExpandedRequest).user;
		const userId = user?.id;

		const { id } = req.params;
		const { status, deliveryDate } = req.body;

		const sale = await Sales.findOne({
			where: { id },
			include: [
				{
					model: Product,
					as: "soldProducts",
					where: { sellerId: userId },
				},
			],
		});

		if (!sale) {
			return sendResponse(res, 404, "NOT FOUND", "Sale not found");
		}

		await sale?.update({ status, deliveryDate });

		await updateOrderStatusMiddleware(req, res, () => {
			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Sale status updated successfully",
				sale,
			);
		});
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

export default {
	allSales,
	singleSale,
	updateOrderStatus,
};
