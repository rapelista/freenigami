import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const urls = [
    `https://storage.shngm.id/thumbnail/cover/`,
    `https://storage.shngm.id/low/unsafe/filters:format(webp):quality(70)/thumbnail/image/`,
  ];

  const response = await Promise.any(
    urls.map((url) =>
      fetch(`${url}${id}`).then((res) => {
        if (!res.ok) {
          throw new Error();
        }

        return res;
      }),
    ),
  );

  const blob = await response.blob();

  const headers = new Headers();

  headers.set('Content-Type', blob.type);

  return new NextResponse(blob, { headers });
}
