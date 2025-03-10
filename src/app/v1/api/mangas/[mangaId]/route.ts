import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ mangaId: string }> }
) {
  const { mangaId } = await params;

  const response = await fetch(
    "https://api.shngm.io/v1/manga/detail/" + mangaId
  );

  const data = await response.json();

  return NextResponse.json(data);
}
