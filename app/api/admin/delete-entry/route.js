import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const DATA_PATH = path.join(process.cwd(), "data", "entries.json");

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    if (process.env.ADMIN_PASSWORD && body.adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const normalizedDate = (body.date || "").trim();
    if (!normalizedDate) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const entries = JSON.parse(raw);
    const filtered = entries.filter((entry) => entry.date !== normalizedDate);

    fs.writeFileSync(DATA_PATH, `${JSON.stringify(filtered, null, 2)}\n`, "utf-8");

    return NextResponse.json({ success: true, deletedDate: normalizedDate });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
