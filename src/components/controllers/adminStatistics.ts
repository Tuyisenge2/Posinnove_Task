import { Request, Response } from "express";
import { sendResponse } from "../utils/http.exception";
import { User } from "../database/models/User";
import { Role } from "../database/models/role";
import { Sales } from "../database/models/sales";
import { Product } from "../database/models/product";
import { Order } from "../database/models/order";

export const adminStatistics = async (req: Request, res: Response) => {
	try {
		const SellerID = await Role.findOne({ where: { roleName: "SELLER" } });
		const buyerID = await Role.findOne({ where: { roleName: "BUYER" } });
		const allSellers = await User.findAndCountAll({
			where: { role: SellerID?.dataValues.id },
		});
		const allBuyers = await User.findAndCountAll({
			where: { role: buyerID?.dataValues.id },
		});
		const activeBuyers = allBuyers.rows.filter((item) => item.isActive);
		const activeSellers = allSellers.rows.filter((item) => item.isActive);
		const allOrders = await Order.findAndCountAll({
			include: {
				model: Sales,
				as: "sales",
				attributes: {
					exclude: ["createdAt", "updatedAt", "orderId", "buyerId"],
				},
				include: [
					{
						model: Product,
						as: "soldProducts",
						attributes: ["name", "images", "price"],
					},
				],
			},
		});
		const completedOrder = allOrders.rows.filter(
			(item) => item.status === "delivered",
		);
		const completedOrderPercent =
			(completedOrder.length * 100) / allOrders.rows.length;
		const data = {
			Numbersofsellers: allSellers,
			NumberofBuyer: allBuyers,
			NumberofOrders: allOrders,
			activeBuyers: activeBuyers.length,
			activeSellers: activeSellers.length,
			completedOrderPercent,
			completedOrder,
		};
		return sendResponse(res, 200, "SUCCESS", "Here is your statistics", data);
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
