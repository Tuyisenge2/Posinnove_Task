import { Request, Response } from "express";
import { sendResponse } from "../utils/http.exception";
import { join } from "node:path";
import { read_function } from "../utils/db_methods";
import { messageModelAttributes } from "../types/model";
import { User } from "../database/models/User";

export const chat = async (req: Request, res: Response) => {
	res.sendFile(join(__dirname, "../../public/index.html"));
};

export const chatLogin = async (req: Request, res: Response) => {
	res.sendFile(join(__dirname, "../../public/login.html"));
};

export const read_all_messages = async (req: Request, res: Response) => {
	const include = [
		{
			model: User,
			as: "sender",
			attributes: ["id", "firstName", "lastName", "email", "role"],
		},
	];
	const messages = await read_function<messageModelAttributes>(
		"message",
		"findAll",
		{ include },
	);
	return sendResponse(
		res,
		200,
		"SUCCESS",
		"Messages retrieved successfully!",
		messages,
	);
};
