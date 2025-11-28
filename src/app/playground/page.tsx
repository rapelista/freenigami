import Image from 'next/image';

export default function Page() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="relative aspect-1/2">
        <Image
          fill
          alt="Wow"
          loading="eager"
          sizes="25vw"
          src="/api/proxy/image/3b04e4c6-0ea3-4afb-a1bd-b85e54c912a4.jpg"
        />
      </div>
      <div className="relative aspect-1/2">
        <Image
          fill
          alt="Wow"
          loading="eager"
          sizes="25vw"
          src="/api/proxy/image/723f844e-3d5b-4a68-a93f-3d746c5c85aa.jpg"
        />
      </div>
      <div className="relative aspect-1/2">
        <Image
          fill
          alt="Wow"
          loading="eager"
          sizes="25vw"
          src="/api/proxy/image/639354fc-af0d-45ad-b52a-2d58ef802aa2.jpg"
        />
      </div>
      <div className="relative aspect-1/2">
        <Image
          fill
          alt="Wow"
          loading="eager"
          sizes="25vw"
          src="/api/proxy/image/971350ac-e01d-43bb-8e1e-52385e372ae6.jpg"
        />
      </div>
    </div>
  );
}
