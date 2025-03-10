import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch(
    "https://storage.shngm.id/chapter/manga_16778db0-17c0-43c4-aa4a-3a4a0df5ec0b/chapter_2e785ea3-8838-479f-89f8-ea0671e3e8b7/98-1410f9.jpg",
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
