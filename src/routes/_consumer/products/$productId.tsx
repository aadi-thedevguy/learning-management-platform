import { NotFoundComponent } from "@/components/NotFoundComponent";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, asc } from "drizzle-orm";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/drizzle/schema";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { formatPrice, formatPlural } from "@/lib/formatters";
import { sumArray } from "@/lib/sumArray";
import { Image } from "@unpic/react";
import { Suspense } from "react";
import { SkeletonButton } from "@/components/Skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoIcon } from "lucide-react";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { userOwnsProduct } from "@/features/products/db/products";
import { getCurrentUser } from "@/services/clerk";
import { getUserCoupon } from "@/lib/userCountryHeader";

export const getPublicProduct = createServerFn()
  .inputValidator(z.object({ productId: z.string() }))
  .handler(async ({ data }) => {
    const product = await db.query.ProductTable.findFirst({
      columns: {
        id: true,
        name: true,
        description: true,
        priceInDollars: true,
        imageUrl: true,
      },
      where: and(eq(ProductTable.id, data.productId), wherePublicProducts),
      with: {
        courseProducts: {
          columns: {},
          with: {
            course: {
              columns: { id: true, name: true },
              with: {
                courseSections: {
                  columns: { id: true, name: true },
                  where: wherePublicCourseSections,
                  orderBy: asc(CourseSectionTable.order),
                  with: {
                    lessons: {
                      columns: { id: true, name: true, status: true },
                      where: wherePublicLessons,
                      orderBy: asc(LessonTable.order),
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (product == null) throw notFound();

    const { courseProducts, ...other } = product;
    const { userId } = await getCurrentUser();

    if (!userId) {
      return {
        ...other,
        courses: courseProducts.map((cp) => cp.course),
        alreadyOwnsProduct: false,
        coupon: undefined,
      };
    }

    const alreadyOwnsProduct = await userOwnsProduct({
      userId,
      productId: product.id,
    });
    const coupon = await getUserCoupon();
    return {
      ...other,
      courses: courseProducts.map((cp) => cp.course),
      alreadyOwnsProduct,
      coupon,
    };
  });

export const Route = createFileRoute("/_consumer/products/$productId")({
  loader: ({ params }) => getPublicProduct({ data: params }),
  component: ProductPage,
  notFoundComponent: () => <NotFoundComponent />,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const courseCount = product.courses.length;
  const lessonCount = sumArray(product.courses, (course) =>
    sumArray(course.courseSections, (s) => s.lessons.length),
  );

  return (
    <div className="container my-6">
      <div className="flex gap-16 items-center justify-between">
        <div className="flex gap-6 flex-col items-start">
          <div className="flex flex-col gap-2">
            <Suspense
              fallback={
                <div className="text-xl">
                  {formatPrice(product.priceInDollars)}
                </div>
              }
            >
              <Price price={product.priceInDollars} coupon={product.coupon} />
            </Suspense>
            <h1 className="text-4xl font-semibold">{product.name}</h1>
            <div className="text-muted-foreground">
              {formatPlural(courseCount, {
                singular: "course",
                plural: "courses",
              })}{" "}
              •{" "}
              {formatPlural(lessonCount, {
                singular: "lesson",
                plural: "lessons",
              })}
            </div>
          </div>
          <div className="text-xl">{product.description}</div>
          <Suspense fallback={<SkeletonButton className="h-12 w-36" />}>
            <PurchaseButton
              productId={product.id}
              alreadyOwnsProduct={product.alreadyOwnsProduct}
            />
          </Suspense>
        </div>
        <div className="relative aspect-video max-w-lg grow">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fullWidth"
            className="object-contain rounded-xl"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
        {product.courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                {formatPlural(course.courseSections.length, {
                  plural: "sections",
                  singular: "section",
                })}{" "}
                •{" "}
                {formatPlural(
                  sumArray(course.courseSections, (s) => s.lessons.length),
                  {
                    plural: "lessons",
                    singular: "lesson",
                  },
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {course.courseSections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="flex gap-2">
                      <div className="flex flex-col grow">
                        <span className="text-lg">{section.name}</span>
                        <span className="text-muted-foreground">
                          {formatPlural(section.lessons.length, {
                            plural: "lessons",
                            singular: "lesson",
                          })}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 text-base"
                        >
                          <VideoIcon className="size-4" />
                          {lesson.status === "preview" ? (
                            <Link
                              to="/courses/$courseId/lessons/$lessonId"
                              params={{
                                courseId: course.id,
                                lessonId: lesson.id,
                              }}
                              className="underline text-accent"
                            >
                              {lesson.name}
                            </Link>
                          ) : (
                            lesson.name
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PurchaseButton({
  productId,
  alreadyOwnsProduct = false,
}: {
  productId: string;
  alreadyOwnsProduct?: boolean;
}) {
  if (alreadyOwnsProduct) {
    return (
      <p className="text-muted-foreground">You already own this product</p>
    );
  }

  return (
    <Button className="text-xl h-auto py-4 px-8 rounded-lg" asChild>
      <Link to="/products/$productId/purchase" params={{ productId }}>
        Get Now
      </Link>
    </Button>
  );
}

function Price({
  price,
  coupon,
}: {
  price: number;
  coupon: { discountPercentage: number } | undefined;
}) {
  if (price === 0 || !coupon) {
    return <div className="text-xl">{formatPrice(price)}</div>;
  }

  return (
    <div className="flex gap-2 items-baseline">
      <div className="line-through text-sm opacity-50">
        {formatPrice(price)}
      </div>
      <div className="text-xl">
        {formatPrice(price * (1 - coupon.discountPercentage))}
      </div>
    </div>
  );
}
