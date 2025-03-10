import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ thumbnailId: string }> }
) {
  const { thumbnailId } = await params;

  const urls = [
    `https://storage.shngm.id/low/unsafe/filters:format(webp):quality(70)/thumbnail/image/`,
    `https://storage.shngm.id/thumbnail/cover/`,
  ];

  const response = await Promise.any(
    urls.map((url) => fetch(`${url}${thumbnailId}`))
  );

  const blob = await response.blob();

  const headers = new Headers();
  headers.set("Content-Type", blob.type);

  return new NextResponse(blob, { headers });
}
