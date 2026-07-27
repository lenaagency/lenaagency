import bcrypt from "bcryptjs";
import { parseCsv } from "@/lib/sheets-export";
import type { MemberRole, RoyaltyMember } from "@/lib/royalty-types";

function normHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

const HEADER_MAP: Record<string, keyof RoyaltyMember | "password" | "password_hash"> = {
  email: "email",
  e_mail: "email",
  이메일: "email",
  name: "name",
  이름: "name",
  display_name: "name",
  role: "role",
  역할: "role",
  org: "org",
  organization: "org",
  publisher: "org",
  출판사: "org",
  소속: "org",
  partner: "org",
  password: "password",
  비밀번호: "password",
  password_hash: "password_hash",
  passwordhash: "password_hash",
  비밀번호해시: "password_hash",
};

function parseRole(raw: string): MemberRole {
  const v = raw.trim().toLowerCase().replace(/[\s_-]+/g, "_");
  if (v === "admin" || v === "관리자" || v === "administrator") return "admin";
  if (
    v === "rights_holder" ||
    v === "rightsholder" ||
    v === "rights" ||
    v === "licensor" ||
    v === "저작권사" ||
    v === "저작권" ||
    v === "holder"
  ) {
    return "rights_holder";
  }
  if (
    v === "publisher" ||
    v === "출판사" ||
    v === "licensee" ||
    v === "partner" ||
    v === "파트너"
  ) {
    return "publisher";
  }
  // Default: publisher (legacy partner accounts)
  return "publisher";
}

function memberFromRow(
  headers: string[],
  cells: string[]
): RoyaltyMember | null {
  const get = (key: string) => {
    const i = headers.indexOf(key);
    return i >= 0 ? (cells[i] ?? "").trim() : "";
  };

  const email = get("email").toLowerCase();
  if (!email || !email.includes("@")) return null;

  const passwordHash = get("password_hash") || undefined;
  const passwordPlain = get("password") || undefined;
  if (!passwordHash && !passwordPlain) return null;

  return {
    email,
    name: get("name") || email.split("@")[0],
    role: parseRole(get("role")),
    org: get("org") || "",
    passwordHash,
    passwordPlain,
  };
}

function mapHeader(h: string): string {
  const raw = h.replace(/^\uFEFF/, "").trim();
  const lower = raw.toLowerCase();
  const n = normHeader(raw);
  const mapped =
    HEADER_MAP[n] ?? HEADER_MAP[lower] ?? HEADER_MAP[raw];
  return (mapped as string) ?? n;
}

function parseMembersCsv(text: string): RoyaltyMember[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(mapHeader);
  const out: RoyaltyMember[] = [];
  for (let r = 1; r < rows.length; r++) {
    const m = memberFromRow(headers, rows[r]);
    if (m) out.push(m);
  }
  return out;
}

function membersFromEnvJson(): RoyaltyMember[] {
  const raw = process.env.ROYALTY_MEMBERS_JSON?.trim();
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Array<Record<string, string>>;
    if (!Array.isArray(arr)) return [];
    const out: RoyaltyMember[] = [];
    for (const item of arr) {
      const email = String(item.email || "")
        .toLowerCase()
        .trim();
      if (!email) continue;
      out.push({
        email,
        name: String(item.name || email.split("@")[0]),
        role: parseRole(String(item.role || "publisher")),
        org: String(item.org || item.organization || item.publisher || item.rightsHolder || ""),
        passwordHash: item.passwordHash || item.password_hash || undefined,
        passwordPlain: item.password || undefined,
      });
    }
    return out;
  } catch {
    return [];
  }
}

function adminFromEnv(): RoyaltyMember | null {
  const email = process.env.ROYALTY_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ROYALTY_ADMIN_PASSWORD?.trim();
  if (!email || !password) return null;
  return {
    email,
    name: process.env.ROYALTY_ADMIN_NAME?.trim() || "LENA Admin",
    role: "admin",
    org: "LENA Agency",
    passwordPlain: password,
  };
}

export function getMembersCsvUrl(): string | null {
  const full = process.env.GOOGLE_MEMBERS_CSV_URL?.trim();
  if (full) return full;
  const id = process.env.GOOGLE_MEMBERS_SHEETS_ID?.trim();
  if (!id) return null;
  const gid = process.env.GOOGLE_MEMBERS_GID?.trim() || "0";
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

async function fetchMembersFromSheet(): Promise<RoyaltyMember[]> {
  const url = getMembersCsvUrl();
  if (!url) return [];
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "LENA-Agency-Royalties/1.0" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const text = await res.text();
    if (text.trimStart().startsWith("<!")) return [];
    return parseMembersCsv(text);
  } catch {
    return [];
  }
}

/** All members: admin env + JSON env + optional Members sheet */
export async function loadMembers(): Promise<RoyaltyMember[]> {
  const map = new Map<string, RoyaltyMember>();

  const admin = adminFromEnv();
  if (admin) map.set(admin.email, admin);

  for (const m of membersFromEnvJson()) {
    map.set(m.email, m);
  }

  for (const m of await fetchMembersFromSheet()) {
    // Sheet overwrites same email (admin can manage accounts in sheet)
    map.set(m.email, m);
  }

  // Keep env admin role if sheet re-adds same email without admin role
  if (admin && map.get(admin.email)?.role !== "admin") {
    const existing = map.get(admin.email)!;
    map.set(admin.email, { ...existing, role: "admin", org: existing.org || admin.org });
  }

  return Array.from(map.values());
}

export async function findMemberByEmail(
  email: string
): Promise<RoyaltyMember | null> {
  const members = await loadMembers();
  return members.find((m) => m.email === email.toLowerCase().trim()) ?? null;
}

export async function verifyMemberPassword(
  member: RoyaltyMember,
  password: string
): Promise<boolean> {
  if (member.passwordHash) {
    try {
      if (await bcrypt.compare(password, member.passwordHash)) return true;
    } catch {
      /* ignore */
    }
  }
  if (member.passwordPlain && member.passwordPlain === password) return true;
  return false;
}
