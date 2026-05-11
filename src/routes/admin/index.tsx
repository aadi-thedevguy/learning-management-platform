import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { count, countDistinct, isNotNull, sql, sum } from "drizzle-orm";
import type { ReactNode } from "react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
	CourseSectionTable,
	CourseTable,
	LessonTable,
	ProductTable,
	PurchaseTable,
	UserCourseAccessTable,
} from "@/drizzle/schema";
import { formatNumber, formatPrice } from "@/lib/formatters";

export const getAdminStats = createServerFn().handler(async () => {
	const purchaseRows = await db
		.select({
			totalSales: sql<number>`COALESCE(${sum(
				PurchaseTable.pricePaidInCents,
			)}, 0)`.mapWith(Number),
			totalPurchases: count(PurchaseTable.id),
			totalUsers: countDistinct(PurchaseTable.userId),
			isRefund: isNotNull(PurchaseTable.refundedAt),
		})
		.from(PurchaseTable)
		.groupBy((table) => table.isRefund);

	const [refundData] = purchaseRows.filter((row) => row.isRefund);
	const [salesData] = purchaseRows.filter((row) => !row.isRefund);

	const [students] = await db
		.select({ value: countDistinct(UserCourseAccessTable.userId) })
		.from(UserCourseAccessTable);
	const [courses] = await db
		.select({ value: count(CourseTable.id) })
		.from(CourseTable);
	const [products] = await db
		.select({ value: count(ProductTable.id) })
		.from(ProductTable);
	const [lessons] = await db
		.select({ value: count(LessonTable.id) })
		.from(LessonTable);
	const [sections] = await db
		.select({ value: count(CourseSectionTable.id) })
		.from(CourseSectionTable);

	const netPurchases = salesData?.totalPurchases ?? 0;
	const totalUsers = salesData?.totalUsers ?? 0;

	return {
		netSales: (salesData?.totalSales ?? 0) / 100,
		totalRefunds: (refundData?.totalSales ?? 0) / 100,
		netPurchases,
		refundedPurchases: refundData?.totalPurchases ?? 0,
		averageNetPurchasesPerCustomer:
			totalUsers > 0 ? netPurchases / totalUsers : 0,
		students: students?.value ?? 0,
		products: products?.value ?? 0,
		courses: courses?.value ?? 0,
		sections: sections?.value ?? 0,
		lessons: lessons?.value ?? 0,
	};
});

export const Route = createFileRoute("/admin/")({
	loader: () => getAdminStats(),
	component: AdminPage,
});

function AdminPage() {
	const stats = Route.useLoaderData();

	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 md:grid-cols-4 gap-4">
			<StatCard title="Net Sales">{formatPrice(stats.netSales)}</StatCard>
			<StatCard title="Refunded Sales">
				{formatPrice(stats.totalRefunds)}
			</StatCard>
			<StatCard title="Un-Refunded Purchases">
				{formatNumber(stats.netPurchases)}
			</StatCard>
			<StatCard title="Refunded Purchases">
				{formatNumber(stats.refundedPurchases)}
			</StatCard>
			<StatCard title="Purchases Per User">
				{formatNumber(stats.averageNetPurchasesPerCustomer, {
					maximumFractionDigits: 2,
				})}
			</StatCard>
			<StatCard title="Students">{formatNumber(stats.students)}</StatCard>
			<StatCard title="Products">{formatNumber(stats.products)}</StatCard>
			<StatCard title="Courses">{formatNumber(stats.courses)}</StatCard>
			<StatCard title="CourseSections">{formatNumber(stats.sections)}</StatCard>
			<StatCard title="Lessons">{formatNumber(stats.lessons)}</StatCard>
		</div>
	);
}

function StatCard({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Card>
			<CardHeader className="text-center">
				<CardDescription>{title}</CardDescription>
				<CardTitle className="font-bold text-2xl">{children}</CardTitle>
			</CardHeader>
		</Card>
	);
}
