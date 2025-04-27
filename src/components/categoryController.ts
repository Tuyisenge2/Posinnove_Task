import { Request, Response } from "express";
import { sendResponse } from "../utils/http.exception";
import database_models from "../database/config/db.config";
import { insert_function, read_function } from "../utils/db_methods";
import { category_utils } from "../utils/controller";
import { CategoryAttributes } from "../types/model";

let condition;
let categoryId;

const add_category = async (req: Request, res: Response) => {
	try {
		const { name, description } = req.body;
		condition = { where: { name } };
		const category_exist = await read_function<CategoryAttributes>(
			"Category",
			"findOne",
			condition,
		);

		if (category_exist) {
			return sendResponse(
				res,
				409,
				"CONFLICT",
				`Category named ${name} already exist!`,
			);
		}

		const category = await insert_function<CategoryAttributes>(
			"Category",
			"create",
			{ name, description },
		);

		return sendResponse(
			res,
			201,
			"SUCCESS",
			"Category added successfully!",
			category,
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

const read_all_categories = async (_req: Request, res: Response) => {
	try {
		condition = {
			include: [
				{
					model: database_models.Product,
					as: "products",
				},
			],
		};
		const categories = await read_function<CategoryAttributes>(
			"Category",
			"findAll",
			condition,
		);

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Categories fetched successfully!",
			categories,
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

const read_single_category = async (req: Request, res: Response) => {
	try {
		categoryId = category_utils(req, res).getId;
		const isValidUUID = category_utils(req, res).isValidUUID(categoryId);
		if (!isValidUUID) {
			return;
		}
		condition = {
			where: { id: categoryId },
			include: [
				{
					model: database_models.Product,
					as: "products",
				},
			],
		};

		const category = await read_function<CategoryAttributes>(
			"Category",
			"findOne",
			condition,
		);

		if (!category) {
			return sendResponse(res, 404, "NOT FOUND", "Category not found!");
		}
		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Category fetched successfully!",
			category,
		);
	} catch (error: unknown) {
		return sendResponse(
			res,
			400,
			"BAD REQUEST",
			"Something went wrong!",
			error as Error,
		);
	}
};

const update_category = async (req: Request, res: Response) => {
	categoryId = category_utils(req, res).getId;
	const isValidUUID = category_utils(req, res).isValidUUID(categoryId);
	if (!isValidUUID) {
		return;
	}
	condition = {
		where: {
			id: categoryId,
		},
	};

	const category = await read_function<CategoryAttributes>(
		"Category",
		"findOne",
		condition,
	);
	if (!category) {
		return sendResponse(res, 404, "NOT FOUND", "Category not found!");
	}

	const updated_field = req.body;
	if (Object.keys(updated_field).length === 0) {
		return sendResponse(
			res,
			400,
			"BAD REQUEST",
			"No field provided to update!",
		);
	}

	await insert_function<CategoryAttributes>(
		"Category",
		"update",
		updated_field,
		condition,
	);
	const updated_category = await read_function<CategoryAttributes>(
		"Category",
		"findOne",
		condition,
	);

	return sendResponse(
		res,
		200,
		"SUCCESS",
		"Category updated successfully!",
		updated_category,
	);
};

export default {
	add_category,
	update_category,
	read_all_categories,
	read_single_category,
};
