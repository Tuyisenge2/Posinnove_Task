import { Request, Response } from "express";
import { sendResponse } from "../utils/http.exception";
import { insert_function, read_function } from "../utils/db_methods";
import { querriesModelAttributes } from "../types/model";
import { Querries } from "../database/models/querry";

export const createQuerry = async (req: Request, res: Response) => {
	try {
		const { firstName, lastName, email, subject, message } = req.body;

		const newQuerry = await insert_function<Querries>("Querries", "create", {
			firstName,
			lastName,
			email,
			subject,
			message,
		});

		return sendResponse(
			res,
			201,
			"CREATED",
			"Message sent successfully",
			newQuerry,
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

export const read_allQuerries = async (req: Request, res: Response) => {
	try {
		const querries = await read_function<querriesModelAttributes>(
			"Querries",
			"findAll",
		);

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Querries fetched successfully",
			querries,
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

export const read_oneQuerry = async (req: Request, res: Response) => {
	try {
		const querries = await read_function<querriesModelAttributes>(
			"Querries",
			"findOne",
			{
				where: {
					id: req.params.id,
				},
			},
		);

		if (!querries) {
			return sendResponse(res, 404, "NOT FOUND", "Querry not found");
		}

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Querry fetched successfully",
			querries,
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
