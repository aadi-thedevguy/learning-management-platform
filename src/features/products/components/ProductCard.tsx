import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";

export function ProductCard({
	id,
	imageUrl,
	name,
	priceInDollars,
	description,
}: {
	id: string;
	imageUrl: string;
	name: string;
	priceInDollars: number;
	description: string;
}) {
	return (
		<Card className="overflow-hidden flex flex-col w-full max-w-[500px] mx-auto">
			<div className="relative aspect-video w-full">
				<Image
					src={imageUrl}
					alt={name}
					className="object-cover"
					layout="fullWidth"
				/>
			</div>
			<CardHeader className="space-y-0">
				<CardDescription>{formatPrice(priceInDollars)}</CardDescription>
				<CardTitle className="text-xl">{name}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="line-clamp-3">{description}</p>
			</CardContent>
			<CardFooter className="mt-auto">
				<Button className="w-full text-md py-y" asChild>
					<Link
						to="/products/$productId"
						params={{
							productId: id,
						}}
					>
						View Course
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
