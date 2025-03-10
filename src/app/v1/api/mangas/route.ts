import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch("https://api.shngm.io/v1/manga/list");
  const data = await response.json();

  return NextResponse.json(data);
}
