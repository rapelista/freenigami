import { ChapterDetail } from '~/components/chapter/[chapterId]/detail';

export default async function Page({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;

  return (
    <main className="w-full mx-auto h-full">
      <ChapterDetail chapterId={chapterId} />
    </main>
  );
}
