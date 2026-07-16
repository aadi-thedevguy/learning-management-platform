import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
	redirect_url: z.string().optional(),
});

export const Route = createFileRoute("/sign-in/$")({
	validateSearch: searchSchema,
	component: () => {
		const { redirect_url } = Route.useSearch();
		return (
			<div className="container my-6 flex justify-center">
				<SignIn forceRedirectUrl={redirect_url} />
			</div>
		);
	},
});
