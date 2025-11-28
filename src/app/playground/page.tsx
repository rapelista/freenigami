import Image from 'next/image';

export default function Page() {
  const src = '/api/proxy/image/3b04e4c6-0ea3-4afb-a1bd-b85e54c912a4.jpg';

  return <Image alt="Wow" height={1440} src={src} width={720} />;
}
