import fs from "fs";
import path from "path";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

/**
 * Local interior previews (no sheet required):
 *   public/previews/{bookId}/1.png … 4.png
 *   public/previews/{bookId}-1.png … {bookId}-4.png
 */
export function localPreviewImages(bookId: string): string[] {
  if (!bookId) return [];
  const root = path.join(process.cwd(), "public", "previews");
  const out: string[] = [];

  const dir = path.join(root, bookId);
  try {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const files = fs
        .readdirSync(dir)
        .filter((f) => IMAGE_EXT.test(f))
        .sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
        );
      for (const f of files) {
        out.push(`/previews/${bookId}/${f}`);
      }
      if (out.length) return out.slice(0, 8);
    }
  } catch {
    /* ignore */
  }

  for (let i = 1; i <= 8; i++) {
    for (const ext of ["png", "jpg", "jpeg", "webp", "gif"]) {
      const name = `${bookId}-${i}.${ext}`;
      const full = path.join(root, name);
      try {
        if (fs.existsSync(full)) {
          out.push(`/previews/${name}`);
          break;
        }
      } catch {
        /* ignore */
      }
    }
  }
  return out.slice(0, 8);
}

/** Fill empty previewImages from local public/previews files. */
export function withLocalPreviews<
  T extends { id: string; previewImages?: string[] },
>(titles: T[]): T[] {
  return titles.map((t) => {
    if (t.previewImages && t.previewImages.length > 0) return t;
    const local = localPreviewImages(t.id);
    if (!local.length) return t;
    return { ...t, previewImages: local };
  });
}
