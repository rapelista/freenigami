import { Latest } from '~/components/latest';
import { Recommendation } from '~/components/recommendation';

export default function Home() {
  return (
    <main className="max-w-[1440px] mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Rekomendasi</h1>

        <Recommendation />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Update Terbaru</h1>

        <Latest />
      </div>
    </main>
  );
}
