import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { ProductCard } from "@/features/products/components/ProductCard";
import { wherePublicProducts } from "@/features/products/permissions/products";

export const getPublicProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    return db.query.ProductTable.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
        priceInDollars: true,
        imageUrl: true,
      },
      where: wherePublicProducts,
      orderBy: asc(ProductTable.name),
    });
  },
);

export const Route = createFileRoute("/_consumer/")({
  loader: () => getPublicProducts(),
  component: HomePage,
});

function HomePage() {
  const products = Route.useLoaderData();

  return (
    <div className="container my-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
