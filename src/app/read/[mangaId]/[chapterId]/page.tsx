import { ChapterImages } from "~/components/mangas/chapters/images";

export default async function Page({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const chapterId = (await params).chapterId;

  return <ChapterImages {...{ chapterId }} />;
}
