import cloudinary from "./cloudinary";
import { CLOUDINARY_FOLDER_NAME } from "../utils/keys";
import { Info, Message } from "../types/upload";
import { Request } from "express";

const folder = CLOUDINARY_FOLDER_NAME;

export const uploadSingle = async (image: string) => {
	try {
		const result = await cloudinary.uploader.upload(image, {
			folder,
		});
		return result;
	} catch (error) {
		const err = (error as Error).message;
		return { error: err };
	}
};

export const uploadMultiple = async (images: any, req: Request) => {
	const imageUrls = [];
	const errors = [];

	if (images.length < 3 || images.length > 8) {
		(req as Info<Message>).info = {
			message:
				images.length < 3
					? "Product must have at least 3 images!"
					: "Product can't have more than 8 images!",
		};
	}

	for (const i in images) {
		try {
			const data = await uploadSingle(images[i].path);
			if ("error" in data) {
				(req as Info<Message>).info = {
					message: "Uploading image failed!",
				};
			} else {
				imageUrls.push(data?.secure_url);
			}
		} catch (error: any) {
			errors.push(error.message);
			(req as Info<Message>).info = {
				message: message(imageUrls.length, errors) as string,
			};
		}
	}
	return { images: imageUrls as string[] };
};

function message(imageLen: number, errors: any) {
	if (errors.length > 0) {
		return `${
			imageLen === 0 ? "No" : imageLen
		} other product images were uploaded, (${
			errors.length
		}) went wrong as ${errors
			.filter((error: Error, index: number) => errors.indexOf(error) === index)
			.join(", ")}!`;
	}
}

export const deleteCloudinaryFile = async (url: string) => {
	try {
		await cloudinary.uploader.destroy(url);
		return true;
	} catch (error) {
		return error;
	}
};
