import { db } from "./src/drizzle/db";
import { UserTable } from "./src/drizzle/schema";
import { isNull } from "drizzle-orm";

async function test() {
  console.log(
    db.insert(UserTable).values({
      clerkUserId: "123",
      email: "test@test.com",
      name: "Test",
    }).onConflictDoUpdate({
      target: [UserTable.clerkUserId],
      set: { name: "Test 2" },
      where: isNull(UserTable.deletedAt),
    }).toSQL()
  );
}

test();
