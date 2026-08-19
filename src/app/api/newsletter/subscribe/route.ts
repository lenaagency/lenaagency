import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BREVO_API = "https://api.brevo.com/v3";

/** Allowed list keys → env var names (IDs never trusted from the client alone). */
const LIST_ENV: Record<string, string> = {
  "ko-kids": "BREVO_LIST_ID_KO_KIDS",
  "ko-anglo": "BREVO_LIST_ID_KO_ANGLO",
  "ko-japan": "BREVO_LIST_ID_KO_JAPAN",
  "en-adults": "BREVO_LIST_ID_EN_ADULTS",
  "en-kids": "BREVO_LIST_ID_EN_KIDS",
};

type Body = {
  email?: string;
  lang?: string;
  lists?: string[];
  website?: string; // honeypot
};

function parseListId(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(String(raw).trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

function resolveListIds(keys: string[]): { ids: number[]; missing: string[] } {
  const ids: number[] = [];
  const missing: string[] = [];
  const seen = new Set<number>();

  for (const key of keys) {
    const envName = LIST_ENV[key];
    if (!envName) continue;
    const id = parseListId(process.env[envName]);
    if (!id) {
      missing.push(key);
      continue;
    }
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return { ids, missing };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const lang = String(body.lang || "ko").trim().toLowerCase() === "en" ? "en" : "ko";
  const rawLists = Array.isArray(body.lists) ? body.lists.map(String) : [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid email / 이메일 주소를 확인해 주세요.",
      },
      { status: 400 }
    );
  }

  // Only allow keys that match the current site language
  const allowedPrefix = lang === "en" ? "en-" : "ko-";
  const listKeys = [
    ...new Set(
      rawLists
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.startsWith(allowedPrefix) && k in LIST_ENV)
    ),
  ];

  if (listKeys.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Please select at least one list. / 구독할 리스트를 하나 이상 선택해 주세요.",
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    console.error("[newsletter] BREVO_API_KEY missing");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Newsletter is not configured yet. Please try again later. / 뉴스레터 연동이 아직 설정되지 않았습니다.",
      },
      { status: 503 }
    );
  }

  const { ids: listIds, missing } = resolveListIds(listKeys);
  if (listIds.length === 0) {
    console.error("[newsletter] no list ids resolved", listKeys, missing);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Newsletter list is not configured. / 뉴스레터 리스트가 설정되지 않았습니다.",
      },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${BREVO_API}/contacts`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email,
        listIds,
        updateEnabled: true,
        attributes: {
          LANGUAGE: lang === "en" ? "EN" : "KO",
          SOURCE: "website",
        },
      }),
    });

    if (res.ok || res.status === 204) {
      return NextResponse.json({ ok: true, lang, listIds, lists: listKeys });
    }

    const data = (await res.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
    };

    if (
      res.status === 400 &&
      /already|duplicate|exist/i.test(String(data.message || data.code || ""))
    ) {
      return NextResponse.json({
        ok: true,
        lang,
        listIds,
        lists: listKeys,
        existing: true,
      });
    }

    console.error("[newsletter] brevo failed", res.status, data);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Failed to subscribe. Please try again later. / 구독 신청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 502 }
    );
  } catch (err) {
    console.error("[newsletter] network", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Network error. Please try again. / 네트워크 오류입니다. 다시 시도해 주세요.",
      },
      { status: 502 }
    );
  }
}
