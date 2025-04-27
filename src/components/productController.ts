import { Request, Response } from "express";
import { ExpandedRequest } from "../middlewares/auth";
import { sendResponse } from "../utils/http.exception";
import {
	ProductAttributes,
	ProductCreationAttributes,
	CategoryAttributes,
} from "../types/model";
import { Category } from "../database/models/category";
import { deleteCloudinaryFile, uploadMultiple } from "../helpers/upload";
import { User } from "../database/models/User";
import { insert_function, read_function } from "../utils/db_methods";
import { category_utils } from "../utils/controller";
import { Info, Message } from "../types/upload";
import { isAvailable } from "../utils/nodeEvents";
import { Op, OrderItem } from "sequelize";

let product_id;
const include = [
	{
		model: User,
		as: "seller",
		attributes: ["id", "firstName", "lastName", "email", "role"],
	},
	{
		model: Category,
		as: "category",
		attributes: ["id", "name", "description"],
	},
];

const create_product = async (req: Request, res: Response) => {
	try {
		const user = (req as ExpandedRequest).user;
		const sellerId = user?.id;
		const { name, price, discount, quantity, categoryId, expiryDate } =
			req.body;

		const product_condition = { where: { name, sellerId } };
		const category_condition = { where: { id: categoryId } };

		const productExist = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			product_condition,
		);
		if (productExist) {
			return sendResponse(
				res,
				409,
				"CONFLICT",
				"Product already exist, You can update it instead!",
			);
		}

		const categoryExist = await read_function<CategoryAttributes>(
			"Category",
			"findOne",
			category_condition,
		);

		if (!categoryExist) {
			return sendResponse(
				res,
				400,
				"BAD REQUEST",
				"Category doesn't exist, create one and try again!",
			);
		}

		const files = req.files;
		const images: string[] = (await uploadMultiple(files, req))
			.images as string[];
		const image_error = (req as Info<Message>).info;

		if (image_error) {
			return sendResponse(res, 400, "BAD REQUEST", image_error.message);
		}
		const productData: ProductCreationAttributes = {
			name,
			images,
			price,
			discount,
			quantity,
			categoryId,
			sellerId,
			expiryDate,
		};
		const product = await insert_function<ProductAttributes>(
			"Product",
			"create",
			productData,
		);

		return sendResponse(
			res,
			201,
			"SUCCESS",
			"Product added successfully!",
			product,
		);
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

const read_all_products = async (req: Request, res: Response) => {
	try {
		const user = (req as ExpandedRequest).user;
		const sellerId = user?.id;
		const condition_one = { where: { sellerId }, include };
		const condition_two = { where: { isAvailable }, include };
		let products;

		if (user?.role === "SELLER") {
			products = await read_function<ProductAttributes>(
				"Product",
				"findAll",
				condition_one,
			);
			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Products fetched successfully!",
				products,
			);
		} else {
			products = await read_function<ProductAttributes>(
				"Product",
				"findAll",
				condition_two,
			);
			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Products fetched successfully!",
				products,
			);
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

const read_single_product = async (req: Request, res: Response) => {
	try {
		product_id = category_utils(req, res).getId;
		const isValidUUID = category_utils(req, res).isValidUUID(product_id);
		if (!isValidUUID) {
			return;
		}
		const user = (req as ExpandedRequest).user;
		const sellerId = user?.id;
		const condition_one = { where: { id: product_id, sellerId }, include };
		const condition_two = {
			where: { id: product_id, isAvailable },
			include,
		};
		let product;

		if (user?.role === "SELLER") {
			product = await read_function<ProductAttributes>(
				"Product",
				"findOne",
				condition_one,
			);
			if (!product) {
				return sendResponse(
					res,
					404,
					"NOT FOUND",
					"Product not found or not owned!",
				);
			}
			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Product fetched successfully!",
				product,
			);
		} else {
			product = await read_function<ProductAttributes>(
				"Product",
				"findOne",
				condition_two,
			);
			if (!product) {
				return sendResponse(
					res,
					404,
					"NOT FOUND",
					"Product not found or not owned!",
				);
			}

			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Product fetched successfully!",
				product,
			);
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

const getRecommendedProducts = async (req: Request, res: Response) => {
	try {
		const productId = req.body.id as string;
		const product = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			{ where: { id: productId }, include },
		);

		if (!product) {
			return sendResponse(
				res,
				404,
				"NOT FOUND",
				"Product not found or not owned!",
			);
		}

		const condition = {
			where: {
				categoryId: product.categoryId,
				isAvailable: true,
				id: { [Op.ne]: productId },
			},
			include,
			limit: 5,
			order: [["createdAt", "DESC"]] as OrderItem[],
		};
		const recommended = await read_function<ProductAttributes>(
			"Product",
			"findAll",
			condition,
		);
		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Recommended Products fetched successfully!",
			recommended,
		);
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

const update_product = async (req: Request, res: Response) => {
	try {
		product_id = category_utils(req, res).getId;
		const isValidUUID = category_utils(req, res).isValidUUID(product_id);
		if (!isValidUUID) {
			return;
		}
		const user = (req as ExpandedRequest).user;
		const sellerId = user?.id;
		const condition = {
			where: {
				id: product_id,
				sellerId,
			},
		};

		const productExist = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			condition,
		);
		if (!productExist) {
			return sendResponse(
				res,
				404,
				"NOT FOUND",
				"The product you're trying to update is not found or owned!",
			);
		}

		const update_info = req.body;
		const { categoryId } = update_info;

		if (categoryId) {
			const category = await read_function<CategoryAttributes>(
				"Category",
				"findOne",
				{ where: { id: categoryId } },
			);
			if (!category) {
				return sendResponse(
					res,
					400,
					"BAD REQUEST",
					"Category doesn't exist, create one and try again!",
				);
			}
		}

		let images: string[];
		let updated_data;

		const files: any = req.files;
		if (files?.length !== 0) {
			images = (await uploadMultiple(files, req)).images as string[];
			const image_error = (req as Info<Message>).info;
			if (image_error) {
				return sendResponse(res, 400, "BAD REQUEST", image_error.message);
			}
			updated_data = { ...update_info, images };
		} else {
			updated_data = update_info;
		}

		await insert_function<ProductAttributes>(
			"Product",
			"update",
			updated_data,
			condition,
		);
		const updated_product = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			condition,
		);
		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Product updated successfully!",
			updated_product,
		);
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

const update_product_status = async (req: Request, res: Response) => {
	try {
		product_id = category_utils(req, res).getId;
		const isValidUUID = category_utils(req, res).isValidUUID(product_id);

		if (!isValidUUID) {
			return;
		}

		const user = (req as ExpandedRequest).user;
		const sellerId = user?.id;

		const condition = {
			where: {
				id: product_id,
				sellerId,
			},
		};

		const productExist = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			condition,
		);
		if (!productExist) {
			return sendResponse(
				res,
				404,
				"NOT FOUND",
				"The product you're trying to update status for is not found or owned!",
			);
		}

		const newStatus = !productExist.isAvailable;

		const updatedData: Partial<ProductAttributes> = {
			isAvailable: newStatus,
		};

		await insert_function<ProductAttributes>(
			"Product",
			"update",
			updatedData,
			condition,
		);

		const updated_product = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			condition,
		);
		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Product status updated successfully!",
			updated_product,
		);
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

const delete_product = async (req: Request, res: Response) => {
	try {
		product_id = category_utils(req, res).getId;
		const isValidUUID = category_utils(req, res).isValidUUID(product_id);
		if (!isValidUUID) {
			return;
		}
		const user = (req as ExpandedRequest).user;
		const sellerId = user?.id;

		const condition = {
			where: {
				id: product_id,
				sellerId,
			},
		};

		const productExist = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			condition,
		);
		if (productExist) {
			const { images } = productExist;
			const deletingImages = images.map(async (image: string) => {
				await deleteCloudinaryFile(image.split("/")[7].split(".")[0]);
			});
			await Promise.all(deletingImages);

			const result = await read_function<ProductAttributes>(
				"Product",
				"destroy",
				condition,
			);
			if (result) {
				return sendResponse(
					res,
					200,
					"SUCCESS",
					"Product deleted successfully!",
				);
			}
		} else {
			return sendResponse(
				res,
				404,
				"NOT FOUND",
				"The product you're trying to delete is not found or owned!",
			);
		}
	} catch (error: any) {
		if (error.name === "SequelizeForeignKeyConstraintError") {
			return sendResponse(
				res,
				400,
				"CASCADE DELETE REQUIRED",
				"Cannot delete the product because it is linked to other records.",
			);
		}
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something went wrong!",
			error as Error,
		);
	}
};

const guest_read_all_products = async (req: Request, res: Response) => {
	try {
		const condition = { where: { isAvailable }, include };
		const products = await read_function<ProductAttributes>(
			"Product",
			"findAll",
			condition,
		);
		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Products fetched successfully!",
			products,
		);
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

const guest_read_single_product = async (req: Request, res: Response) => {
	try {
		product_id = category_utils(req, res).getId;
		const isValidUUID = category_utils(req, res).isValidUUID(product_id);
		if (!isValidUUID) {
			return;
		}
		const condition = { where: { id: product_id, isAvailable }, include };
		const product = await read_function<ProductAttributes>(
			"Product",
			"findOne",
			condition,
		);
		if (!product) {
			return sendResponse(
				res,
				404,
				"NOT FOUND",
				"Product not found or not available!",
			);
		}
		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Product fetched successfully!",
			product,
		);
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
	create_product,
	update_product,
	update_product_status,
	read_all_products,
	read_single_product,
	delete_product,
	guest_read_all_products,
	guest_read_single_product,
	getRecommendedProducts,
};
