import { Request, Response } from "express";
import { sendResponse } from "../utils/http.exception";
import searchCondtion from "../services/seachServices";
import database_models from "../database/config/db.config";
import { Op } from "sequelize";

const search_product = async (req: Request, res: Response) => {
	try {
		const conditions = await searchCondtion(req.query);
		const product = await database_models.Product.findAll({
			where: {
				...conditions,
				expiryDate: {
					[Op.gt]: new Date(),
				},
				isAvailable: {
					[Op.not]: false,
				},
			},
		});
		if (!product || product.length === 0) {
			return res.status(200).json({
				message: "no product found",
			});
		} else {
			return res.status(200).json({
				status: "success",
				product: product,
			});
		}
	} catch (error: unknown) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something went wrong!",
			error as Error,
		);
	}
};

export default {
	search_product,
};
