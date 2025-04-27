import { Request, Response } from "express";
import database_models from "../database/config/db.config";
import { sendResponse } from "../utils/http.exception";
import { insert_function, read_function } from "../utils/db_methods";
import {
	UserModelAttributes,
	roleCreationAttributes,
	roleModelAttributes,
} from "../types/model";

let condition;

export const allRole = async (req: Request, res: Response) => {
	try {
		if (req.body) {
			const roles = await read_function<roleModelAttributes>("role", "findAll");
			return sendResponse(
				res,
				200,
				"SUCCESS",
				"we have following roles",
				roles,
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

export const createRole = async (req: Request, res: Response) => {
	try {
		condition = { where: { roleName: req.body.roleName }, raw: true };
		if (req.body) {
			const exist = await read_function<roleModelAttributes>(
				"role",
				"findOne",
				condition,
			);
			if (exist) {
				return sendResponse(res, 409, "CONFLICT", "role already exist");
			}
			const data: roleCreationAttributes = {
				roleName: req.body.roleName,
			};
			const role = await insert_function<roleModelAttributes>(
				"role",
				"create",
				{ ...data },
			);
			return sendResponse(
				res,
				201,
				"SUCCESS",
				"Role created successfully",
				role,
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

export const assignRole = async (req: Request, res: Response) => {
	try {
		if (req.body) {
			const { role } = req.body;
			const userId = req.params.userId;
			condition = { where: { roleName: role } };

			const assigned_role = await read_function<roleModelAttributes>(
				"role",
				"findOne",
				condition,
			);
			if (!assigned_role) {
				return sendResponse(res, 404, "NOT FOUND", "role not found");
			}
			await insert_function<roleModelAttributes>(
				"User",
				"update",
				{ role: assigned_role.id },
				{ where: { id: userId } },
			);
			const user = await read_function<UserModelAttributes>("User", "findOne", {
				where: { id: userId },
				include: [
					{
						model: database_models.role,
						as: "Roles",
					},
				],
			});
			return sendResponse(
				res,
				201,
				"SUCCESS",
				"Role assigned successfully!",
				user,
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

export const updateRole = async (req: Request, res: Response) => {
	const { id } = req.params;
	const role = await read_function<roleModelAttributes>("role", "findOne", {
		where: { id },
		raw: true,
	});
	if (!role) {
		return sendResponse(res, 404, "NOT FOUND", `Role with ${id} doesn't exist`);
	}
	await insert_function<roleModelAttributes>(
		"role",
		"update",
		{ roleName: req.body.roleName },
		{ where: { id } },
	);
	return sendResponse(res, 201, "SUCCESS", "Role updated successfully");
};
