import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  fetchContractsFromSheet,
  filterContractsForUser,
} from "@/lib/sheets-contracts";
import {
  canEditRoyalties,
  normalizeMemberRole,
} from "@/lib/royalty-types";

/**
 * Authenticated royalty / contract list.
 * Backed by Google Sheet — new rows appear after short revalidation (~60s).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = normalizeMemberRole(session.user.role ?? "publisher");
  // Keep raw role for filter if JWT still has "partner"
  const filterRole = session.user.role ?? "publisher";
  const org = session.user.org ?? "";

  const url = new URL(req.url);
  const fresh = url.searchParams.get("fresh") === "1";

  const { contracts, source, error, syncedAt } = await fetchContractsFromSheet({
    fresh,
  });
  const filtered = filterContractsForUser(contracts, filterRole, org);
  const writeEnabled =
    canEditRoyalties(filterRole) &&
    Boolean(process.env.GOOGLE_CONTRACTS_WRITE_URL?.trim());
  const canEdit = canEditRoyalties(filterRole);

  return NextResponse.json(
    {
      contracts: filtered,
      source,
      error: error ?? null,
      syncedAt: syncedAt ?? null,
      writeEnabled,
      canEdit,
      user: {
        email: session.user.email,
        name: session.user.name,
        role,
        org,
      },
      count: filtered.length,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
