import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ mangaId: string; chapterId: string }> }
) {
  const { chapterId } = await params;
  const response = await fetch(
    `https://api.shngm.io/v1/chapter/detail/${chapterId}`
  );

  const data = await response.json();

  return NextResponse.json(data);
}
