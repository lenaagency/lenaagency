import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  fetchContractsFromSheet,
  filterContractsForUser,
} from "@/lib/sheets-contracts";
import {
  buildRoyaltyExcelBuffer,
  royaltyExcelFilename,
} from "@/lib/royalty-excel";

/**
 * Download filtered royalty list as Excel (.xlsx).
 * Headers in English; Korean title values remain Korean.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role ?? "publisher";
  const org = session.user.org ?? "";

  const url = new URL(req.url);
  const fresh = url.searchParams.get("fresh") === "1";

  const { contracts } = await fetchContractsFromSheet({ fresh });
  const filtered = filterContractsForUser(contracts, role, org);

  const buffer = buildRoyaltyExcelBuffer(filtered);
  const filename = royaltyExcelFilename(org || "all", role);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
