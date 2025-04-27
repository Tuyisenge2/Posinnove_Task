import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../utils/keys";
import { validateToken } from "../utils/token.validation";
import { Response } from "express";

export interface TokenData {
	id: string | number;
	role: string;
	otp?: string;
	email?: string;
	isPasswordExpired?: boolean;
}
export interface resetTokenData {
	id: string | number;
	email: string;
}

export const generateAccessToken = (userData: TokenData) => {
	const token = jwt.sign(userData, ACCESS_TOKEN_SECRET as string, {
		expiresIn: "1y",
	});
	return token;
};

export const verifyAccessToken = (token: string, res: Response) => {
	const tokenValidation = validateToken(token, ACCESS_TOKEN_SECRET as string);

	if (!tokenValidation.valid) {
		return res.status(401).json({
			status: "UNAUTHORIZED",
			message: tokenValidation.reason,
		});
	}

	return jwt.verify(String(token), ACCESS_TOKEN_SECRET as string);
};
