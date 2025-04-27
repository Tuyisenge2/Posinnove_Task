import { Request, Response } from "express";
import { sendResponse } from "../utils/http.exception";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Product } from "../database/models/product";

export const sellerStatistics = async (req: Request, res: Response) => {
	try {
		const seller_token = req.headers.authorization?.split(" ")[1];
		if (seller_token) {
			const decoded_seller_token = jwt.decode(seller_token) as JwtPayload;
			const { id } = decoded_seller_token;
			if (id) {
				const allProducts = await Product.findAndCountAll({
					where: { sellerId: id },
				});
				const productSales = await Product.findAll({ where: { sellerId: id } });
				let currentProductsValue = 0;
				let loss = 0;
				let numberOfExpiredProducts = 0;
				let allProductsValue = 0;
				let totalNumberOfProducts = 0;

				productSales.forEach((product) => {
					totalNumberOfProducts++;
					const today = new Date();
					const expired = product.dataValues.expiryDate < today;

					if (expired) {
						product.dataValues.isExpired = true;
						loss += product.dataValues.price * product.dataValues.quantity;
						numberOfExpiredProducts++;
					} else {
						currentProductsValue +=
							product.dataValues.price * product.dataValues.quantity;
					}
				});

				allProductsValue = productSales.reduce(
					(acc, product) =>
						acc + product.dataValues.price * product.dataValues.quantity,
					0,
				);

				const totalRemainingProducts =
					totalNumberOfProducts - numberOfExpiredProducts;

				const data = {
					totalProducts: allProducts.count,
					allProductsValue: allProductsValue,
					numberOfExpiredProducts: numberOfExpiredProducts,
					loss: loss,
					currentProductsValue: currentProductsValue,
					totalRemainingProducts: totalRemainingProducts,
				};

				return sendResponse(
					res,
					200,
					"SUCCESS",
					"Here is your statistics",
					data,
				);
			}
		}
	} catch (error) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Internal server error",
			(error as Error).message,
		);
	}
};
