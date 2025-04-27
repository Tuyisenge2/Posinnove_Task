import { Response } from "express";
import { insert_function, read_function } from "../utils/db_methods";
import { reviewsAttribute } from "../types/model";
import { sendResponse } from "../utils/http.exception";
import { ExpandedRequest } from "../middlewares/auth";
import { sendEmail } from "../helpers/nodemailer";
import { review_product_email_template } from "../utils/html.utils";
import { User } from "../database/models/User";
import { Product } from "../database/models/product";

export const getAllReview = async (req: ExpandedRequest, res: Response) => {
	try {
		const reviews = await read_function<reviewsAttribute>("review", "findAll");
		return sendResponse(
			res,
			201,
			"SUCCESS",
			"review retrieved successfully!",
			reviews,
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

export const createReview = async (req: ExpandedRequest, res: Response) => {
	try {
		const { feedBack, ratings } = req.body;
		const user = req.user;
		const product = req.product;
		const seller = req.product?.seller;
		const reviewData = {
			userId: user?.id,
			productId: product?.id,
			feedBack,
			ratings,
		};
		const review = await insert_function<reviewsAttribute>(
			"review",
			"create",
			reviewData,
		);
		await sendEmail({
			to: seller?.email as string,
			subject: "Product Review",
			html: review_product_email_template(
				seller?.userName as string,
				review,
				product?.name as string,
			),
		});

		return sendResponse(
			res,
			201,
			"SUCCESS",
			"review added successfully!",
			review,
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
export const getReviewsOnProduct = async (
	req: ExpandedRequest,
	res: Response,
) => {
	try {
		const productId = req.product?.id;

		const reviews = await read_function<reviewsAttribute>("review", "findAll", {
			where: { productId },
			include: [
				{ model: User, as: "user", attributes: { exclude: ["id"] } },
				{
					model: Product,
					as: "product",
					attributes: { exclude: ["id"] },
				},
			],
		});
		return sendResponse(
			res,
			200,
			"SUCCESS",
			"review retrieved successfully!",
			reviews,
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

export const updateReviews = async (req: ExpandedRequest, res: Response) => {
	try {
		const review = req.review;
		const condition = { where: { id: review?.id } };
		const updated_data = {
			feedBack: req.body.feedBack,
			ratings: req.body.ratings,
		};
		await insert_function<reviewsAttribute>(
			"review",
			"update",
			updated_data,
			condition,
		);
		return sendResponse(res, 201, "SUCCESS", "review Updated successfully!");
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

export const deleteReviews = async (req: ExpandedRequest, res: Response) => {
	try {
		const review = req.review;
		const condition = { where: { id: review?.id } };
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const result = await read_function<reviewsAttribute>(
			"review",
			"destroy",
			condition,
		);
		return sendResponse(res, 201, "SUCCESS", "review deleted successfully!");
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
