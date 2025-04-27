import { Request, Response } from "express";
import { ACCESS_TOKEN_SECRET, BASE_URL } from "../utils/keys";
import { generateAccessToken } from "../helpers/security.helpers";
import Jwt from "jsonwebtoken";
import { sendEmail } from "../helpers/nodemailer";
import { hashPassword } from "../utils/password";
import { resetTokenData } from "../helpers/security.helpers";
import { isValidPassword } from "../utils/password.checks";
import { insert_function, read_function } from "../utils/db_methods";
import {
	UserModelAttributes,
	resetPasswordModelAtributes,
} from "../types/model";
import { sendResponse } from "../utils/http.exception";
import HTML_TEMPLATE from "../utils/mail-template";

let condition;

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		condition = { where: { email: email } };

		const isUserExist = await read_function<UserModelAttributes>(
			"User",
			"findOne",
			condition,
		);
		if (!isUserExist) {
			return sendResponse(res, 404, "NOT FOUND", "User not found");
		}

		const resetToken = generateAccessToken({
			id: isUserExist?.id,
			role: isUserExist?.role,
			email: isUserExist?.email,
		});
		await read_function<resetPasswordModelAtributes>(
			"resetPassword",
			"destroy",
			condition,
		);
		await insert_function<resetPasswordModelAtributes>(
			"resetPassword",
			"create",
			{ resetToken, email },
			condition,
		);

		const host = `${BASE_URL}/users`;
		const confirmlink: string = `${host}/reset-password?token=${resetToken}`;

		const mailOptions = {
			to: email,
			subject: "Reset Password",
			html: HTML_TEMPLATE(
				`
<div style="max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;">
        <h3 style="color: #333333;">Welcome to ShopTrove!</h3>
        <p>To have new new password, click the button below to reset your password:</p> <br/> <br/>
       <a href="${confirmlink}" style="
      background-color: MediumSeaGreen;
      color: white;
      padding: 6px 20px;
      border: none;
      border-radius: 5px;
      text-decoration: none;
    ">Reset Password</a>
	 <br/> <br/>
        <p>Thank you for working with us!</p>
        <p>Best regards,</p>
        <p>The ShopTrove Team</p>
    </div>
`,
				"Reset Password",
			),
		};

		await sendEmail(mailOptions);
		return sendResponse(res, 200, "SUCCESS", "Email sent successfully");
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

export const resetPasswort = async (req: Request, res: Response) => {
	try {
		const { password } = req.body!;
		const { token } = req.params;
		condition = { where: { resetToken: token } };

		const tokenAvailability = await read_function<resetPasswordModelAtributes>(
			"resetPassword",
			"findOne",
			condition,
		);

		if (!tokenAvailability) {
			return sendResponse(res, 400, "BAD REQUEST", "Invalid link");
		}

		const decoded = Jwt.verify(token, ACCESS_TOKEN_SECRET!) as resetTokenData;

		const resettingUser = await read_function<UserModelAttributes>(
			"User",
			"findOne",
			{ where: { id: decoded.id! } },
		);
		const sameAsOldPassword = await isValidPassword(
			password,
			resettingUser?.password as string,
		);

		if (sameAsOldPassword) {
			return sendResponse(
				res,
				400,
				"BAD REQUEST",
				"Password cannot be the same as the old password",
			);
		}
		const hashedPassword: string = (await hashPassword(password)) as string;

		await insert_function<UserModelAttributes>(
			"User",
			"update",
			{ password: hashedPassword },
			{ where: { id: decoded.id! } },
		);
		await read_function<resetPasswordModelAtributes>(
			"resetPassword",
			"destroy",
			condition,
		);
		return sendResponse(res, 200, "SUCCESS", "Password reset successfully");
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
