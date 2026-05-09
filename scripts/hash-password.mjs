import { hash } from "bcryptjs";

async function readPasswordFromStdin() {
  if (process.stdin.isTTY) {
    return null;
  }

  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8").trim();
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.error('Usage: pnpm hash-password -- "your-password"');
    console.error("   or: printf '%s' 'your-password' | pnpm hash-password");
    process.exitCode = 0;
    return;
  }

  const passwordFromArgs = process.argv.slice(2).join(" ").trim();
  const password = passwordFromArgs || (await readPasswordFromStdin());

  if (!password) {
    console.error("A plaintext password is required.");
    console.error('Usage: pnpm hash-password -- "your-password"');
    console.error("   or: printf '%s' 'your-password' | pnpm hash-password");
    process.exitCode = 1;
    return;
  }

  const hashedPassword = await hash(password, 12);
  console.log(hashedPassword);
}

main().catch((error) => {
  const message =
    error instanceof Error ? error.message : "Unknown hashing error.";

  console.error(`Failed to hash password: ${message}`);
  process.exit(1);
});
