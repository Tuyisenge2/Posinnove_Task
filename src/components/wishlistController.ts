import { Request, Response } from "express";
import sequelize from "sequelize";
import { Product } from "../database/models/product";
import { Wishes } from "../database/models/wishlist";
import { ExpandedRequest } from "../middlewares/auth";
import {
	ProductAttributes,
	WishesAttributes,
	WishesCreationAttributes,
} from "../types/model";
import { insert_function, read_function } from "../utils/db_methods";
import { sendResponse } from "../utils/http.exception";
import { EventName, myEmitter } from "../utils/nodeEvents";
import { Category } from "../database/models/category";

const include = [
	{
		model: Product,
		as: "product",
		attributes: {
			exclude: ["id"],
			include: [
				"id",
				"name",
				"price",
				"images",
				"discount",
				"quantity",
				"categoryId",
				"sellerId",
				"expiryDate",
			],
		},
	},
];

export const createWishlist = async (req: Request, res: Response) => {
	try {
		const user = (req as ExpandedRequest).user;
		const userId = user?.id;

		const productId = req.body.productId;

		const wish_condition = { where: { userId, productId } };

		const productExist = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			{ where: { id: productId } },
		);
		if (!productExist) {
			return sendResponse(res, 404, "NOT FOUND", "Product not found");
		}

		const wishExist = await read_function<WishesAttributes>(
			"wish",
			"findOne",
			wish_condition,
		);

		if (wishExist) {
			await read_function<WishesAttributes>("wish", "destroy", wish_condition);
			myEmitter.emit(
				EventName.PRODUCT_REMOVED_FROM_WISHLIST,
				userId,
				productId,
			);

			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Product successfully removed from wishlist",
			);
		} else {
			const wishData: WishesCreationAttributes = {
				userId,
				productId,
			};

			const wish = await insert_function<WishesAttributes>(
				"wish",
				"create",
				wishData,
			);

			myEmitter.emit(EventName.PRODUCT_ADDED_TO_WISHLIST, userId, productId);

			return sendResponse(
				res,
				201,
				"SUCCESS",
				"Product added successfully in wishlist!",
				wish,
			);
		}
	} catch (error) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something went wrong!",
			error as Error,
		);
	}
};

export const getWishlist = async (req: Request, res: Response) => {
	try {
		let wishes;
		const user = (req as ExpandedRequest).user;
		const userId = user?.id;

		if (user?.role === "SELLER") {
			const wishedProduct = await Wishes.findAll({
				where: {},
				include: {
					model: Product,
					as: "product",
					where: { sellerId: userId },
				},
				attributes: [
					[
						sequelize.fn("COUNT", sequelize.col("productId")),
						"numberOfUserWishProduct",
					],
				],
				group: ["productId", "product.id"],
			});

			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Seller wishes fetched successfully!",
				wishedProduct,
			);
		} else if (user?.role === "BUYER") {
			wishes = await read_function<WishesAttributes>("wish", "findAll", {
				where: { userId },
				include: [
					{
						model: Product,
						as: "product",
						attributes: { exclude: ["id"] },
						include: [
							{
								model: Category,
								as: "category",
								
								attributes: { exclude: ["id"] },
							},
						],
					},
				],
			});

			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Buyer wishes fetched successfully from wishlist",
				wishes,
			);
		}
	} catch (error) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something went wrong!",
			error as Error,
		);
	}
};

// Get a single wishes
export const getSingleWishlist = async (req: Request, res: Response) => {
	try {
		const productId = (req as ExpandedRequest).product?.id;
		const wish = await read_function<WishesAttributes>("wish", "findOne", {
			where: { productId },
			include,
		});

		if (!wish) {
			return sendResponse(
				res,
				404,
				"NOT FOUND",
				"Product not found in the wishlist",
			);
		}

		const countNumProduct = await Wishes.count({ where: { productId } });

		const sellerData = {
			numberOfUserWishProduct: countNumProduct,
			wish,
		};

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Seller product fetched successfully",
			sellerData,
		);
	} catch (error) {
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
	getWishlist,
	getSingleWishlist,
	createWishlist,
};
