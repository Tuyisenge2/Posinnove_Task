import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import randomatic from "randomatic";
import { User } from "../database/models/User";
import cloudinary from "../helpers/cloudinary";
import { sendEmail } from "../helpers/nodemailer";
import {
	TokenData,
	generateAccessToken,
	verifyAccessToken,
} from "../helpers/security.helpers";
import passport from "../middlewares/passport";
import {
	BlacklistModelAtributes,
	TokenModelAttributes,
	UserModelAttributes,
	UserModelInclude,
} from "../types/model";
import { InfoAttribute } from "../types/passport";
import { insert_function, read_function } from "../utils/db_methods";
import { handleNewUser, handleUserLogin } from "../utils/google.auth";
import { HttpException, sendResponse } from "../utils/http.exception";
import { ACCESS_TOKEN_SECRET, BASE_URL } from "../utils/keys";
import HTML_TEMPLATE from "../utils/mail-template";
import { validateToken } from "../utils/token.validation";
import { Op } from "sequelize";

const registerUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (req.body) {
			passport.authenticate(
				"signup",
				(err: Error, user: UserModelAttributes, info: InfoAttribute) => {
					if (info) {
						return sendResponse(res, 409, "CONFLICT", info.message);
					}
					req.login(user, async () => {
						const token = generateAccessToken({ id: user.id, role: user.role });
						await insert_function<TokenModelAttributes>("Token", "create", {
							token,
						});
						const message = `

						<div style="max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;">
        <h3 style="color: #333333;">Welcome to ShopTrove!</h3>
        <p>To complete your signup process, please verify your account by clicking the link below:</p> <br/> <br/>
        <a href="${BASE_URL}/users/account/verify/${token}" style="
      background-color: MediumSeaGreen;
      color: white;
      padding: 6px 20px;
      border: none;
      border-radius: 5px;
      text-decoration: none;
    ">Verify</a> <br/> <br/>
        <p>Thank you for joining us!</p>
        <p>Best regards,</p>
        <p>The ShopTrove Team</p>
    </div>
						`;
						await sendEmail({
							to: user.email,
							subject: "Verify Email",
							html: HTML_TEMPLATE(message, "Account verification"),
						});
						return sendResponse(
							res,
							201,
							"SUCCESS",
							"Account Created successfully, Please Verify your Account",
						);
					});
				},
			)(req, res, next);
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

const login = async (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate(
		"login",
		(error: Error, user: UserModelAttributes, info: InfoAttribute) => {
			if (error) {
				return sendResponse(res, 400, "BAD REQUEST", "Bad Request!");
			}

			if (info) {
				return sendResponse(res, 400, "BAD REQUEST", info.message);
			}

			(req as any).login(user, async (err: Error) => {
				if (err) {
					return sendResponse(res, 400, "BAD REQUEST", "Bad Request!");
				}

				const { id, email, firstName, lastName, isPasswordExpired } = user;
				const role = (user as UserModelInclude).Roles?.roleName;

				let authenticationtoken: string;
				let tokenData: TokenData;

				if (role === "SELLER") {
					const otp = randomatic("0", 6);

					if (isPasswordExpired) {
						tokenData = { id, role, otp, isPasswordExpired };
					} else {
						tokenData = { id, role, otp };
					}
					authenticationtoken = generateAccessToken(tokenData);

					const host = `${BASE_URL}/users`;
					const authenticationlink = `${host}/2fa?token=${authenticationtoken}`;

					const message = `Hello ${firstName + " " + lastName},<br><br>

        You recently requested to log in to ShopTrove E-Commerce app. To complete the login process,Please enter the following verification code <br><br> OTP:${otp} <br><br> You can also use the following link along with the provided OTP to complete your login:<br><br> <a href ='${authenticationlink}' style="
      background-color: MediumSeaGreen;
      color: white;
      padding: 6px 20px;
      border: none;
      border-radius: 5px;
      text-decoration: none;
    ">Click here to login</a> <br><br> If you didn't request this, you can safely ignore this email. Your account is secure.

        Thank you,<br><br>
        The ShopTrove E-Commerce app Team`;

					const options = {
						to: email,
						subject: "Your Login Verification Code",
						html: HTML_TEMPLATE(message, "Account verification"),
					};
					await insert_function<TokenModelAttributes>("Token", "create", {
						token: authenticationtoken,
					});

					sendEmail(options);
					return sendResponse(
						res,
						202,
						"ACCEPTED",
						"Email sent for verification. Please check your inbox and enter the OTP to complete the authentication process.",
					);
				} else {
					if (isPasswordExpired) {
						tokenData = { id, role, isPasswordExpired };
					} else {
						tokenData = { id, role };
					}
					authenticationtoken = generateAccessToken(tokenData);
					return sendResponse(
						res,
						200,
						"SUCCESS",
						"Login successfully!",
						authenticationtoken,
					);
				}
			});
		},
	)(req, res, next);
};

const accountVerify = async (req: Request, res: Response) => {
	try {
		const token = await read_function<TokenModelAttributes>(
			"Token",
			"findOne",
			{ where: { token: req.params.token } },
		);
		if (!token) {
			return sendResponse(res, 400, "BAD REQUEST", "Invalid link");
		}

		const { user } = validateToken(token.token, ACCESS_TOKEN_SECRET as string);
		if (!user) {
			return sendResponse(res, 400, "BAD REQUEST", "Invalid link");
		}
		await insert_function<UserModelAttributes>(
			"User",
			"update",
			{ isVerified: true },
			{ where: { id: user.id } },
		);
		await read_function<TokenModelAttributes>("Token", "destroy", {
			where: { id: token.id },
		});
		return sendResponse(res, 200, "SUCCESS", "Email verified successfully!");
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

export const googleAuthInit = async (req: Request, res: Response) => {
	passport.authenticate("google", { scope: ["profile", "email"] });
	res.redirect("/api/v1/users/auth/google/callback");
};

export const handleGoogleAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		passport.authenticate(
			"google",
			async (err: Error, user: UserModelAttributes) => {
				const userData = user;
				const userExist = await read_function<UserModelAttributes>(
					"User",
					"findOne",
					{ where: { email: userData.email } },
				);

				if (userExist) {
					return await handleUserLogin(res, userExist);
				}

				return await handleNewUser(res, userData);
			},
		)(req, res, next);
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

const two_factor_authentication = async (req: Request, res: Response) => {
	try {
		const { otp } = req.body;
		const { token } = req.params;
		const decodedToken = verifyAccessToken(token, res) as TokenData;
		if (decodedToken.otp) {
			if (decodedToken.otp && otp === decodedToken.otp) {
				await read_function<TokenModelAttributes>("Token", "destroy", {
					where: { token: token },
				});
				return sendResponse(
					res,
					200,
					"SUCCESS",
					"Account authentication successfully!",
					token,
				);
			} else {
				return sendResponse(
					res,
					401,
					"Unauthorized",
					"Invalid One Time Password!!",
				);
			}
		}
	} catch (error: any) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something went wrong!",
			(error as Error).message,
		);
	}
};

const logout = async (req: Request, res: Response) => {
	try {
		const token = req.headers["authorization"]?.split(" ")[1];
		if (token) {
			await insert_function<BlacklistModelAtributes>("Blacklist", "create", {
				token,
			});
			return sendResponse(res, 201, "CREATED", "Logged out successfully");
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

export const updatePassword = async (req: Request, res: Response) => {
	try {
		const { oldPassword, newPassword, confirmPassword } = req.body;

		const decoded = req.user as JwtPayload;
		const condition = { where: { id: decoded.id } };

		const user = await User.findOne(condition);

		const userPassword = user?.dataValues.password;

		const isPasswordValid = await bcrypt.compare(
			oldPassword,

			userPassword as string,
		);

		if (!isPasswordValid) {
			return res
				.status(400)
				.json(new HttpException("BAD REQUEST", "Old password is incorrect"));
		}

		if (newPassword === oldPassword) {
			return res
				.status(400)
				.json(
					new HttpException(
						"BAD REQUEST",
						"New password cannot be the same as old password",
					),
				);
		}

		if (newPassword !== confirmPassword) {
			return res
				.status(400)
				.json(
					new HttpException(
						"BAD REQUEST",
						"New password and confirm password do not match",
					),
				);
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		const passUpdated = await User.update(
			{ password: hashedPassword, confirmPassword: hashedPassword },
			condition,
		);

		if (passUpdated) {
			await insert_function<UserModelAttributes>(
				"User",
				"update",
				{
					isPasswordExpired: false,
					lastTimePasswordUpdated: new Date(Date.now()),
				},
				condition,
			);
			return sendResponse(res, 200, "SUCCESS", "Password updated successfully");
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
const read_profile = async (req: Request, res: Response) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (token) {
			const decoded = jwt.decode(token) as JwtPayload;
			const { id } = decoded;

			const single_user = await read_function<UserModelAttributes>(
				"User",
				"findOne",
				{ where: { id } },
			);
			const single_user_profile = {
				firstName: single_user.firstName,
				lastName: single_user.lastName,
				email: single_user.email,
				gender: single_user.gender,
				phoneNumber: single_user.phoneNumber,
				birthDate: single_user.birthDate,
				preferredLanguage: single_user.preferredLanguage,
				preferredCurrency: single_user.preferredCurrency,
				profileImage: single_user.profileImage,
				addressLine1: single_user.addressLine1,
				addressLine2: single_user.addressLine2,
				country: single_user.country,
				city: single_user.city,
				zipCode: single_user.zipCode,
			};
			return sendResponse(
				res,
				200,
				"SUCCESS",
				`Hi ${single_user.firstName} Here is your profile`,
				single_user_profile,
			);
		}
	} catch (error) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something Went Wrong",
			(error as Error).message,
		);
	}
};
const update_user_profile = async (req: Request, res: Response) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (token) {
			const decoded = jwt.decode(token) as JwtPayload;
			const { id } = decoded;
			const single_user = await User.findOne({ where: { id } });

			if (single_user) {
				let updated_profile_image = single_user.profileImage;
				if (req.file) {
					const results = await cloudinary.uploader.upload(req.file.path);
					await single_user.update({ profileImage: results.secure_url });
					updated_profile_image = results.secure_url;
				}
				await single_user.update({
					firstName: req.body.firstName || single_user.firstName,
					lastName: req.body.lastName || single_user.lastName,
					gender: req.body.gender || single_user.gender,
					phoneNumber: req.body.phoneNumber || single_user.phoneNumber,
					birthDate: req.body.birthDate || single_user.birthDate,
					profileImage: updated_profile_image || single_user.profileImage,
					preferredLanguage:
						req.body.preferredLanguage || single_user.preferredLanguage,
					preferredCurrency:
						req.body.preferredCurrency || single_user.preferredCurrency,
					addressLine1: req.body.addressLine1 || single_user.addressLine1,
					addressLine2: req.body.addressLine2 || single_user.addressLine2,
					country: req.body.country || single_user.country,
					city: req.body.city || single_user.city,
					zipCode: req.body.zipCode || single_user.zipCode,
				});
			}
			const updated_data = await read_function<UserModelAttributes>(
				"User",
				"findOne",
				{ where: { id } },
			);

			const updated_profile = {
				firstName: updated_data.firstName,
				lastName: updated_data.lastName,
				email: updated_data.email,
				gender: updated_data.gender,
				phoneNumber: updated_data.phoneNumber,
				birthDate: updated_data.birthDate,
				preferredLanguage: updated_data.preferredLanguage,
				preferredCurrency: updated_data.preferredCurrency,
				profileImage: updated_data.profileImage,
				addressLine1: updated_data.addressLine1,
				addressLine2: updated_data.addressLine2,
				country: updated_data.country,
				city: updated_data.city,
				zipCode: updated_data.zipCode,
			};

			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Profile updated successfully",
				updated_profile,
			);
		}
	} catch (error) {
		return sendResponse(
			res,
			500,
			"SERVER ERROR",
			"Something Went Wrong",
			(error as Error).message,
		);
	}
};

export const accountStatus = async (req: Request, res: Response) => {
	const userId = req.params.userId;
	const { isAccountActive, reason } = req.body;

	try {
		const user = await User.findOne({ where: { id: userId } });
		if (!user) {
			return sendResponse(res, 404, "NOT FOUND", "User not found");
		}

		if (isAccountActive === "false") {
			await User.update(
				{ isActive: isAccountActive },
				{ where: { id: userId } },
			);
			const message = `Dear Beloved user ${user.userName}, your account has been disabled due to this reason:  ${reason}. if you have any queries please contact our support team. Thank you.`;
			await sendEmail({
				to: user.email,
				subject: "Account Disabled!",
				html: message,
			});
			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Account disabled successfully",
				reason,
			);
		}
		if (isAccountActive === "true") {
			await User.update(
				{ isActive: isAccountActive },
				{ where: { id: userId } },
			);
			const message = `Dear Beloved user ${user.userName}, your account has been enabled, Thank you for using our application, if you have any queries please contact our support team!.`;
			await sendEmail({
				to: user.email,
				subject: "Account Enabled!",
				html: message,
			});
			return sendResponse(res, 200, "SUCCESS", "Account enabled successfully");
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

export const allUsers = async (req: Request, res: Response) => {
	try {
		if (req.query.page || req.query.search) {
			const page = parseInt(req.query.page as string) || 1;
			const limit = 7;
			const search = req.query.search || "";
			const offset = (page - 1) * limit;
			const { count, rows: users } = await User.findAndCountAll({
				where: {
					email: {
						[Op.iLike]: `%${search}%`,
					},
				},
				limit,
				offset,
			});
			const totalPages = Math.ceil(count / limit);
			return sendResponse(res, 200, "SUCCESS", "Here is a list of users", {
				users,
				totalPages,
				currentPage: page,
				offset,
			});
		} else {
			const users = await read_function<UserModelAttributes>("User", "findAll");
			return sendResponse(
				res,
				200,
				"SUCCESS",
				"Here is a list of users",
				users,
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

export default {
	registerUser,
	login,
	accountVerify,
	two_factor_authentication,
	googleAuthInit,
	handleGoogleAuth,
	logout,
	updatePassword,
	read_profile,
	update_user_profile,
	accountStatus,
	allUsers,
};
