import { copyFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Copies the open-source license into `public/` so Vite serves it as a
 * static, downloadable file.
 *
 * Runs automatically before `dev` and `build` (see `predev`/`prebuild` in
 * package.json) so the copies never drift out of sync.
 */
const root = process.cwd();
const docs = ["LICENSE"];

let hasError = false;

docs.forEach((doc) => {
  const source = join(root, doc);
  const destination = join(root, "public", doc);

  if (!existsSync(source)) {
    hasError = true;
    console.error(` [sync-legal-docs] Missing source file: ${doc}`);
    return;
  }

  copyFileSync(source, destination);
  console.log(` [sync-legal-docs] Synced ${doc} -> public/${doc}`);
});

if (hasError) {
  console.log("\n Legal docs sync failed. See errors above.");
  process.exit(1);
} else {
  console.log("\n Legal docs are synchronized with public/.");
}
