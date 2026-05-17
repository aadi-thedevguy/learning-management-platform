import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { client } from "@/services/payment";

export const Route = createFileRoute("/api/purchases/$paymentId/invoice")({
	server: {
		handlers: {
			GET,
		},
	},
});

async function GET({ params }: { params: { paymentId: string } }) {
	const { sessionClaims } = await auth();

	if (!sessionClaims?.dbId) {
		return redirect({ href: "/sign-in" });
	}

	const { paymentId } = params;

	try {
		console.log("Fetching invoice for payment:", paymentId);

		// Get the raw PDF data from the API
		const response = (await client.invoices.payments.retrieve(
			paymentId,
		)) as unknown;

		console.log("Response type:", typeof response);

		// Convert the response to a buffer
		let buffer: Buffer;

		if (Buffer.isBuffer(response)) {
			buffer = response;
		} else if (typeof response === "string") {
			buffer = Buffer.from(response, "binary");
		} else if (response && typeof response === "object" && "data" in response) {
			buffer = Buffer.from((response as any).data, "binary");
		} else {
			buffer = Buffer.from(JSON.stringify(response), "utf8");
		}

		console.log("PDF generated.");

		// Return the PDF with appropriate headers
		return new Response(buffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="invoice-${paymentId}.pdf"`,
				"Content-Length": String(buffer.length),
			},
		});
	} catch (error) {
		console.error("Error generating invoice:", error);
		return new Response(
			error instanceof Error ? error.message : "Failed to generate invoice",
			{ status: 500 },
		);
	}
}
