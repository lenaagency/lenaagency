const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Safe YouTube embed URL, or null if the value is not a YouTube link/id. */
export function youtubeEmbedSrc(url: string | undefined | null): string | null {
  const raw = String(url || "").trim();
  if (!raw) return null;
  if (YT_ID.test(raw)) {
    return `https://www.youtube-nocookie.com/embed/${raw}`;
  }
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
    let id = "";
    if (host === "youtu.be") {
      id = u.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v") || "";
      if (!id) {
        const parts = u.pathname.split("/").filter(Boolean);
        if (
          parts[0] === "embed" ||
          parts[0] === "shorts" ||
          parts[0] === "live"
        ) {
          id = parts[1] || "";
        }
      }
    }
    if (YT_ID.test(id)) {
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}
