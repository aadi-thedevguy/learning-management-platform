import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { env } from "@/env";

const sesClient = new SESClient({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
});

const fromEmail = env.SES_FROM_EMAIL;

export async function sendEmail({
	to,
	subject,
	html,
	text,
}: {
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
}) {
	const recipients = Array.isArray(to) ? to : [to];
	const command = new SendEmailCommand({
		Source: fromEmail,
		Destination: { ToAddresses: recipients },
		Message: {
			Subject: { Data: subject },
			Body: {
				Html: html ? { Data: html } : undefined,
				Text: text ? { Data: text } : undefined,
			},
		},
	});

	return sesClient.send(command);
}

export async function sendPurchaseConfirmationEmail({
	to,
	userName,
	productName,
}: {
	to: string;
	userName: string;
	productName: string;
}) {
	return sendEmail({
		to,
		subject: `Thank you for purchasing ${productName}`,
		html: `<p>Hi ${userName},</p><p>Thank you for purchasing <strong>${productName}</strong>. You can access your content at <a href="/courses">My Courses</a>.</p>`,
		text: `Hi ${userName},\n\nThank you for purchasing ${productName}. You can access your content at /courses.`,
	});
}
