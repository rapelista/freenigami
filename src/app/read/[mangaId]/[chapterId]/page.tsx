import { ChapterDetail } from "~/components/mangas/chapters/detail";

export default async function Page({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const chapterId = (await params).chapterId;

  return <ChapterDetail {...{ chapterId }} />;
}
