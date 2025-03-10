import { ChapterDetail } from "~/components/mangas/chapters/detail";

async function getImage() {
  const response = await fetch(
    "https://storage.shngm.id/chapter/manga_16778db0-17c0-43c4-aa4a-3a4a0df5ec0b/chapter_2e785ea3-8838-479f-89f8-ea0671e3e8b7/98-1410f9.jpg",
    {
      credentials: "omit",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0",
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

  return await response.blob();
}

export default async function Page({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const chapterId = (await params).chapterId;
  const data = await getImage();

  return <ChapterDetail {...{ chapterId }} />;
}
