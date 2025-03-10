import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ thumbnailId: string }> }
) {
  const { thumbnailId } = await params;
  const type = req.nextUrl.searchParams.get("type");
  console.log(type);

  const response = await fetch(
    type === "potrait"
      ? `https://storage.shngm.id/low/unsafe/filters:format(webp):quality(70)/thumbnail/image/${thumbnailId}`
      : `https://storage.shngm.id/thumbnail/cover/${thumbnailId}`
  );

  const blob = await response.blob();

  const headers = new Headers();
  headers.set("Content-Type", blob.type);

  return new NextResponse(blob, { headers });
}
