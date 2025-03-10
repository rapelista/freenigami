import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      mangaId: string;
      chapterId: string;
      imageId: string;
    }>;
  }
) {
  const { mangaId, chapterId, imageId } = await params;

  const response = await fetch(
    `https://storage.shngm.id/chapter/manga_${mangaId}/chapter_${chapterId}/${imageId}`,
    {
      credentials: "omit",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-GPC": "1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
      },
      referrer: "https://app.shinigami.asia/",
      method: "GET",
      mode: "cors",
    }
  );

  const blob = await response.blob();

  const headers = new Headers();
  headers.set("Content-Type", blob.type);

  return new NextResponse(blob, { headers });
}
