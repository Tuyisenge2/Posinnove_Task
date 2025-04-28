import { responses } from "../responses";

const readNotifications = {
	all: {
		tags: ["Notifications"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "List of all the notifications belongs to user",
		description: "Get all of the notifications",
		responses,
	},
	single: {
		tags: ["Notifications"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "Get a single notification",
		description: "Get a single notification",
		parameters: [
			{
				in: "path",
				name: "id",
				required: true,
				schema: {
					type: "string",
					format: "uuid",
				},
			},
		],
		responses,
	},
};

const markAsRead = {
	tags: ["Notifications"],
	security: [
		{
			bearerAuth: [],
		},
	],
	summary: "Mark a notification as read",
	parameters: [
		{
			in: "path",
			name: "id",
			required: true,
			schema: {
				type: "string",
				format: "uuid",
			},
		},
	],
	responses,
};

const mark_all_as_read = {
	tags: ["Notifications"],
	security: [
		{
			bearerAuth: [],
		},
	],
	summary: "Mark all notifications as read",
	responses,
};

const delete_notifications = {
	tags: ["Notifications"],
	security: [
		{
			bearerAuth: [],
		},
	],
	summary: "Deleting a notification",
	parameters: [
		{
			in: "path",
			name: "notificationId",
			required: true,
			schema: {
				type: "string",
				format: "uuid",
			},
		},
	],
	responses,
};

export const notifications = {
	"/api/v1/notifications": {
		get: readNotifications["all"],
	},
	"/api/v1/notifications/{id}": {
		get: readNotifications["single"],
	},
	"/api/v1/notifications/{id}/": {
		patch: markAsRead,
	},
	"/api/v1/notifications/": {
		patch: mark_all_as_read,
	},
	"/api/v1/notifications/{notificationId}": {
		delete: delete_notifications,
	},
};
