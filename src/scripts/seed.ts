import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { items } from "@/db/schema";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL / DATABASE_URL is not set");

const client = postgres(url, { prepare: false });
const db = drizzle(client, { schema: { items } });

const BOOKS = [
  {
    title: "The Pragmatic Programmer",
    description:
      "Andrew Hunt & David Thomas. A classic on software craftsmanship — practical advice on writing flexible, maintainable code and growing as a developer.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg",
  },
  {
    title: "Clean Code",
    description:
      "Robert C. Martin. Principles and patterns for writing readable, well-structured code, with plenty of before/after examples.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
  },
  {
    title: "Designing Data-Intensive Applications",
    description:
      "Martin Kleppmann. A deep tour of the ideas behind reliable, scalable, and maintainable data systems.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg",
  },
  {
    title: "Refactoring",
    description:
      "Martin Fowler. Improving the design of existing code through a disciplined catalog of small, behavior-preserving transformations.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780134757599-L.jpg",
  },
  {
    title: "You Don't Know JS Yet",
    description:
      "Kyle Simpson. A deep dive into the core mechanisms of JavaScript, from scope and closures to types and coercion.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781091210099-L.jpg",
  },
  {
    title: "Eloquent JavaScript",
    description:
      "Marijn Haverbeke. A modern introduction to programming and JavaScript, with hands-on projects.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781593279509-L.jpg",
  },
  {
    title: "The Mythical Man-Month",
    description:
      "Fred Brooks. Timeless essays on software project management and why adding people to a late project makes it later.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780201835953-L.jpg",
  },
  {
    title: "Structure and Interpretation of Computer Programs",
    description:
      "Abelson & Sussman. The legendary MIT introduction to the principles of computation.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780262510875-L.jpg",
  },
  {
    title: "Introduction to Algorithms",
    description:
      "Cormen, Leiserson, Rivest & Stein (CLRS). The comprehensive reference on algorithms and data structures.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg",
  },
  {
    title: "Code: The Hidden Language of Computer Hardware and Software",
    description:
      "Charles Petzold. How computers work, built up from simple ideas like switches and relays to full processors.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780735611313-L.jpg",
  },
  {
    title: "The Phoenix Project",
    description:
      "Gene Kim et al. A novel about DevOps and how IT work can be transformed to help a business win.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780988262591-L.jpg",
  },
  {
    title: "Domain-Driven Design",
    description:
      "Eric Evans. Tackling complexity in the heart of software by connecting the model to a shared domain language.",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780321125217-L.jpg",
  },
];

async function main() {
  console.log("Seeding items...");
  // idempotent-ish: clear then insert
  await db.delete(items);
  const inserted = await db.insert(items).values(BOOKS).returning();
  console.log(`Inserted ${inserted.length} items.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
