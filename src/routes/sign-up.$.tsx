import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up/$")({
	component: () => (
		<div className="container my-6 flex justify-center">
			<SignUp />
		</div>
	),
});
