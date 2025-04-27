import { NotificationAttributes } from "../types/model";
import { insert_function, read_function } from "../utils/db_methods";
import { User } from "../database/models/User";
import { Request, Response } from "express";
import { sendResponse } from "../utils/http.exception";
import { ExpandedRequest } from "../middlewares/auth";

let notification_id: string;
const include = [
	{
		model: User,
		as: "users",
		attributes: ["id", "firstName", "lastName", "email", "role"],
	},
];
export const read_allNotifications = async (req: Request, res: Response) => {
	try {
		const user = (req as ExpandedRequest).user;
		const userId = user?.id;

		const condition = { where: { userId }, include };

		const notifications = await read_function<NotificationAttributes>(
			"Notification",
			"findAll",
			condition,
		);

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Notifications fetched successfully",
			notifications,
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

export const read_oneNotification = async (req: Request, res: Response) => {
	try {
		const user = (req as ExpandedRequest).user;
		const userId = user?.id;

		notification_id = req.params.id;
		const condition = { where: { userId, id: notification_id }, include };

		const notification = await read_function<NotificationAttributes>(
			"Notification",
			"findOne",
			condition,
		);
		if (!notification) {
			return sendResponse(res, 404, "NOT FOUND", "No notification found!");
		}

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Notification fetched successfully",
			notification,
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

export const update_notification = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		const userId = user?.id;
		notification_id = req.params.id;

		const condition = { where: { userId, id: notification_id } };
		const notification = await read_function<NotificationAttributes>(
			"Notification",
			"findOne",
			condition,
		);

		if (!notification) {
			return sendResponse(res, 404, "NOT FOUND", "Notification not found!");
		}

		const updatedreadabilityStatus: Partial<NotificationAttributes> = {
			unread: !notification.unread,
		};

		// Call the insert_function passing update method
		await insert_function<NotificationAttributes>(
			"Notification",
			"update",
			updatedreadabilityStatus,
			condition, // Ensure the where condition is passed
		);

		// Fetch the updated notification
		const updated_notification = await read_function<NotificationAttributes>(
			"Notification",
			"findOne",
			condition,
		);

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Notification read status toggled successfully",
			updated_notification,
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
export const mark_all_as_read = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		const userId = user?.id;

		const condition = { where: { userId, unread: true } };

		const notifications: NotificationAttributes[] = await read_function<
			NotificationAttributes[]
		>("Notification", "findAll", condition);

		if (notifications.length === 0) {
			return sendResponse(res, 404, "NOT FOUND", "No notifications found!");
		}

		const allUnread = notifications.every(
			(notification) => notification.unread,
		);
		const newUnreadStatus = !allUnread;
		const updatedReadabilityStatus: Partial<NotificationAttributes> = {
			unread: newUnreadStatus,
		};

		await insert_function<NotificationAttributes>(
			"Notification",
			"update",
			updatedReadabilityStatus,
			condition,
		);

		return sendResponse(
			res,
			200,
			"SUCCESS",
			`All notifications marked as ${newUnreadStatus ? "unread" : "read"} successfully`,
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

export const delete_notification = async (req: Request, res: Response) => {
	try {
		const user = (req as any).user;
		const userId = user?.id;
		notification_id = req.params.id;

		const condition = { where: { userId, id: notification_id } };

		const notification = await read_function<NotificationAttributes>(
			"Notification",
			"findOne",
			condition,
		);

		if (!notification) {
			return sendResponse(res, 404, "NOT FOUND", "Notification not found!");
		}

		await read_function<NotificationAttributes>(
			"Notification",
			"destroy",
			condition,
		);

		return sendResponse(
			res,
			200,
			"SUCCESS",
			"Notification deleted successfully",
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
