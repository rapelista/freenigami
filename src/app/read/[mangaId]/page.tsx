import { ChapterList } from "~/components/mangas/chapters/list";

export default async function Page({
  params,
}: {
  params: Promise<{ mangaId: string }>;
}) {
  const mangaId = (await params).mangaId;

  return <ChapterList {...{ mangaId }} />;
}
