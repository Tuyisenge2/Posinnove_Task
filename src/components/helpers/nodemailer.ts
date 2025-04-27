import nodemailer from "nodemailer";
import { EMAIL, PASSWORD, SENDER_NAME } from "../utils/keys";
import { Attachment } from "nodemailer/lib/mailer";

export interface MailOptions {
	to: string;
	subject: string;
	html: any;
	attachments?: Attachment[];
}

const sender = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: EMAIL,
		pass: PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

export async function sendEmail({
	to,
	subject,
	html,
	attachments,
}: MailOptions) {
	const mailOptions: nodemailer.SendMailOptions = {
		from: `"${SENDER_NAME}" <${EMAIL}>`,
		to,
		subject,
		html,
		attachments,
	};

	return new Promise((resolve, reject) => {
		sender.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log("EMAILING USER FAILED:", error);
				reject(error);
			} else {
				resolve(info);
			}
		});
	});
}
