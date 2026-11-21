import Link from 'next/link';

const GROUPS = [
  {
    title: 'Jelajahi',
    links: [
      { href: '/', label: 'Beranda' },
      { href: '/explore', label: 'Komik' },
      { href: '/bookmarks', label: 'Bookmark' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <p className="text-lg font-extrabold tracking-tight">FREENIGAMI</p>
          <p className="max-w-sm text-sm text-muted">
            Baca manga, manhwa, dan manhua terbaru tanpa ribet. Simpan bacaan
            kamu di Bookmark.
          </p>
        </div>

        {GROUPS.map((group) => (
          <div key={group.title} className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">
              {group.title}
            </p>
            <ul className="space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-muted transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
