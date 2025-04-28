import { responses } from "../responses";
const read_messages = {
	tags: ["Messages"],
	security: [
		{
			bearerAuth: [],
		},
	],
	summary: "List of all the messages",
	description: "Get all of the messages",
	responses,
};

export const messages = {
	"/api/v1/chats/messages": {
		get: read_messages,
	},
};
