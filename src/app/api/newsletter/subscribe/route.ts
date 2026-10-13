import { NextResponse } from "next/server";
import { appendNewsletterSignup } from "@/lib/newsletter-sheet";

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
  name?: string;
  company?: string;
  email?: string;
  lang?: string;
  lists?: string[];
  website?: string; // honeypot
};

type BrevoError = { code?: string; message?: string };

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

function errorBlob(err: BrevoError): string {
  return `${err.code || ""} ${err.message || ""}`;
}

function isDuplicateContact(err: BrevoError): boolean {
  return /already|duplicate|exist/i.test(errorBlob(err));
}

function isAttributeError(err: BrevoError): boolean {
  return /attribute|invalid_parameter/i.test(errorBlob(err));
}

async function readBrevoError(res: Response): Promise<BrevoError> {
  return (await res.json().catch(() => ({}))) as BrevoError;
}

async function listAttributeNames(
  headers: Record<string, string>
): Promise<Set<string>> {
  const res = await fetch(`${BREVO_API}/contacts/attributes`, { headers });
  if (!res.ok) {
    console.error("[newsletter] list attributes failed", res.status);
    return new Set();
  }
  const data = (await res.json().catch(() => ({}))) as {
    attributes?: { name?: string }[];
  };
  return new Set(
    (data.attributes || [])
      .map((a) => String(a.name || "").toUpperCase())
      .filter(Boolean)
  );
}

/** Create a normal text attribute. Duplicate = already there. */
async function ensureTextAttribute(
  headers: Record<string, string>,
  name: string
): Promise<boolean> {
  const res = await fetch(
    `${BREVO_API}/contacts/attributes/normal/${encodeURIComponent(name)}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ type: "text" }),
    }
  );
  if (res.ok || res.status === 201 || res.status === 204) return true;
  const err = await readBrevoError(res);
  if (res.status === 400 && /duplicate|already|exist/i.test(errorBlob(err))) {
    return true;
  }
  console.error("[newsletter] ensure attribute failed", name, res.status, err);
  return false;
}

function pickNameKey(existing: Set<string>): "FIRSTNAME" | "FNAME" {
  if (existing.has("FNAME") && !existing.has("FIRSTNAME")) return "FNAME";
  return "FIRSTNAME";
}

function buildAttributes(opts: {
  name: string;
  company: string;
  lang: "en" | "ko";
  nameKey: "FIRSTNAME" | "FNAME";
  existing: Set<string>;
  includeCompany: boolean;
}): Record<string, string> {
  const attributes: Record<string, string> = {
    [opts.nameKey]: opts.name,
  };
  if (opts.includeCompany) attributes.COMPANY = opts.company;
  if (opts.existing.has("LANGUAGE")) {
    attributes.LANGUAGE = opts.lang === "en" ? "EN" : "KO";
  }
  if (opts.existing.has("SOURCE")) attributes.SOURCE = "website";
  return attributes;
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

  const name = String(body.name || "").trim();
  const company = String(body.company || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const lang = String(body.lang || "ko").trim().toLowerCase() === "en" ? "en" : "ko";
  const rawLists = Array.isArray(body.lists) ? body.lists.map(String) : [];

  if (!name || !company) {
    return NextResponse.json(
      {
        ok: false,
        error: "Name and company are required. / 이름과 회사를 입력해 주세요.",
      },
      { status: 400 }
    );
  }

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

  const saveLog = (brevo: "ok" | "existing" | "error" | "") =>
    appendNewsletterSignup({
      name,
      company,
      email,
      lang,
      lists: listKeys,
      brevo,
    });

  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    console.error("[newsletter] BREVO_API_KEY missing");
    await saveLog("error");
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
    await saveLog("error");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Newsletter list is not configured. / 뉴스레터 리스트가 설정되지 않았습니다.",
      },
      { status: 503 }
    );
  }

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "api-key": apiKey,
  };

  async function createContact(attrs: Record<string, string>) {
    return fetch(`${BREVO_API}/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        listIds,
        updateEnabled: true,
        attributes: attrs,
      }),
    });
  }

  async function updateContact(attrs: Record<string, string>) {
    return fetch(`${BREVO_API}/contacts/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        listIds,
        attributes: attrs,
      }),
    });
  }

  async function upsertContact(attrs: Record<string, string>): Promise<{
    ok: boolean;
    status: number;
    err?: BrevoError;
  }> {
    let res = await createContact(attrs);
    if (res.ok || res.status === 204) return { ok: true, status: res.status };
    const err = await readBrevoError(res);
    if (res.status === 400 && isDuplicateContact(err)) {
      res = await updateContact(attrs);
      if (res.ok || res.status === 204) return { ok: true, status: res.status };
      return { ok: false, status: res.status, err: await readBrevoError(res) };
    }
    return { ok: false, status: res.status, err };
  }

  const okBody = { ok: true as const, lang, listIds, lists: listKeys };
  const fail = () =>
    NextResponse.json(
      {
        ok: false,
        error:
          "Failed to subscribe. Please try again later. / 구독 신청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 502 }
    );

  try {
    const existing = await listAttributeNames(headers);
    const nameKey = pickNameKey(existing);
    const companyReady =
      existing.has("COMPANY") || (await ensureTextAttribute(headers, "COMPANY"));
    if (companyReady) existing.add("COMPANY");
    else {
      console.error(
        "[newsletter] COMPANY attribute missing; name will still be saved"
      );
    }

    const attributes = buildAttributes({
      name,
      company,
      lang,
      nameKey,
      existing,
      includeCompany: companyReady,
    });

    let result = await upsertContact(attributes);
    if (result.ok) {
      await saveLog("ok");
      return NextResponse.json(okBody);
    }

    if (result.status === 400 && isAttributeError(result.err || {})) {
      const otherName: "FIRSTNAME" | "FNAME" =
        nameKey === "FIRSTNAME" ? "FNAME" : "FIRSTNAME";
      const retryAttrs = buildAttributes({
        name,
        company,
        lang,
        nameKey: otherName,
        existing,
        includeCompany: companyReady,
      });
      result = await upsertContact(retryAttrs);
      if (result.ok) {
        await saveLog("ok");
        return NextResponse.json(okBody);
      }

      if (result.status === 400 && isAttributeError(result.err || {})) {
        // Last resort so name+company are not dropped if COMPANY is rejected.
        const combined = `${name} · ${company}`.slice(0, 120);
        result = await upsertContact({ [nameKey]: combined });
        if (result.ok) {
          await saveLog("ok");
          return NextResponse.json(okBody);
        }
        result = await upsertContact({ [otherName]: combined });
        if (result.ok) {
          await saveLog("ok");
          return NextResponse.json(okBody);
        }
      }
    }

    console.error("[newsletter] brevo failed", result.status, result.err);
    await saveLog("error");
    return fail();
  } catch (err) {
    console.error("[newsletter] network", err);
    await saveLog("error");
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
