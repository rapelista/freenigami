import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mangaId: string }> }
) {
  const { mangaId } = await params;
  const search = req.nextUrl.searchParams.toString();

  const response = await fetch(
    `https://api.shngm.io/v1/chapter/${mangaId}/list` +
      (search ? `?${search}` : "")
  );

  const data = await response.json();
  return NextResponse.json(data);
}
