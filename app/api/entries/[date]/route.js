import { NextResponse } from "next/server";
import { getEntryByDate, getAdjacentEntries } from "@/lib/entries";

export async function GET(request, { params }) {
  const entry = getEntryByDate(params.date);
  if (!entry) {
    return NextResponse.json({ error: "No entry for this date" }, { status: 404 });
  }
  const { previous, next } = getAdjacentEntries(params.date);
  return NextResponse.json({ entry, previous, next });
}
