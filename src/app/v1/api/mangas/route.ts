import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const response = await fetch(
    "https://api.shngm.io/v1/manga/list" + (params ? `?${params}` : "")
  );

  const data = await response.json();

  return NextResponse.json(data);
}
