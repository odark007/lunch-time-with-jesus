import { NextResponse } from "next/server";
import { getAllEntries } from "@/lib/entries";

export async function GET() {
  const entries = getAllEntries();
  return NextResponse.json({ entries });
}
