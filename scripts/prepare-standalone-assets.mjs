import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");
const standaloneNextRoot = path.join(standaloneRoot, ".next");

if (!existsSync(standaloneRoot)) {
  console.error("Standalone output not found at .next/standalone.");
  process.exit(1);
}

mkdirSync(standaloneNextRoot, { recursive: true });

const copyTargets = [
  {
    from: path.join(projectRoot, ".next", "static"),
    to: path.join(standaloneNextRoot, "static"),
  },
  {
    from: path.join(projectRoot, "public"),
    to: path.join(standaloneRoot, "public"),
  },
];

for (const target of copyTargets) {
  if (!existsSync(target.from)) {
    continue;
  }

  cpSync(target.from, target.to, {
    force: true,
    recursive: true,
  });
}
