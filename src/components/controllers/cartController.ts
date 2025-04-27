import { Response } from "express";
import cartService from "../services/carts.services";

import { ProductAttributes } from "../types/model";

import database_models from "../database/config/db.config";
import { ExpandedRequest } from "../middlewares/auth";
import { read_function } from "../utils/db_methods";
import { sendResponse } from "../utils/http.exception";
import UserUtils from "../utils/users";

const addItemToCart = async (req: ExpandedRequest, res: Response) => {
	try {
		const { productId, quantity } = req.body;
		const userid = UserUtils.getRequestUserId(req);
		const condition = {
			where: {
				id: productId,
			},
		};
		const product = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			condition,
		);

		const newprice =
			(product!.price - (product?.price * product?.discount) / 100) * quantity;

		const item = {
			id: product!.id,
			name: product!.name,
			image: product!.images[0],
			discount: product?.discount,
			quantity: quantity,
			price: product!.price,
			totalPrice: newprice,
		};

		const cart = await cartService.findCartByUserIdService(userid);

		if (!cart) {
			const newCart = new database_models.Cart({
				products: [item],
				userId: userid,
				total: newprice,
			});
			await newCart.save();
			return sendResponse(res, 201, "SUCCESS", "added to cart successfully");
		}

		const itemIndex = cart.products.findIndex((cItem) => cItem.id === item.id);

		if (itemIndex !== -1) {
			cart.products[itemIndex].quantity = item.quantity;
			cart.products[itemIndex].totalPrice = item.totalPrice;
		} else {
			cart.products.push(item);
		}

		const newTotal = cart.products.reduce(
			(acc, cItem) => acc + cItem.totalPrice,
			0,
		);
		cart.total = newTotal;

		await cartService.updateCartProductsAndTotalService(cart, newTotal);

		return sendResponse(res, 201, "SUCCESS", "Added to cart successfully");
	} catch (error) {
		return sendResponse(res, 500, "ERROR", "Internal Server error");
	}
};

const viewCart = async (req: ExpandedRequest, res: Response) => {
	try {
		const userId = UserUtils.getRequestUserId(req);

		const cart = await cartService.findCartByUserIdService(userId);
		return cart
			? sendResponse(res, 200, "SUCCESS", "Cart Successfully fetched", cart)
			: sendResponse(res, 200, "SUCCESS", "Cart is empty", []);
	} catch (error) {
		return sendResponse(res, 500, "ERROR", "Internal Server Error");
	}
};
const clearCart = async (req: ExpandedRequest, res: Response) => {
	try {
		const userId = UserUtils.getRequestUserId(req);
		const cart = await cartService.findCartByUserIdService(userId);
		if (!cart) return sendResponse(res, 404, "ERROR", "Cart does not exist");
		cart.dataValues.products = [];
		cart.dataValues.total = 0;
		await cartService.updateCartService(userId, cart);

		return sendResponse(res, 200, "SUCCESS", "Cart Successfully Clear", cart);
	} catch (error) {
		return sendResponse(res, 500, "ERROR", "Internal Server Error");
	}
};

const updateCart = async (req: ExpandedRequest, res: Response) => {
	try {
		const userId = UserUtils.getRequestUserId(req);
		const { productId } = req.body;
		const cart = await cartService.findCartByUserIdService(userId);

		if (!cart) return sendResponse(res, 404, "ERROR", "Cart does not exist");

		const itemIndex = cart.products.findIndex(
			(cItem) => cItem.id === productId,
		);

		if (itemIndex === -1) {
			return sendResponse(res, 404, "NOT FOUND", "Product does not exist");
		}

		const removedProduct = cart.products.splice(itemIndex, 1);
		cart.total -= removedProduct[0].totalPrice;
		await cartService.updateCartService(userId, cart);

		return sendResponse(res, 201, "SUCCESS", "Cart successfully updated", cart);
	} catch (error) {
		return sendResponse(res, 500, "ERROR", "Internal Server Error");
	}
};
export { addItemToCart, viewCart, clearCart, updateCart };
