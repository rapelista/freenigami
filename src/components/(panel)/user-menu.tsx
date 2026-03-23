'use client';

import { Avatar, Dropdown, Label } from '@heroui/react';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { authClient } from '~/lib/auth/client';

export function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isNonAnonymous = session?.user && !session.user.isAnonymous;

  if (!isNonAnonymous) {
    return (
      <Link href="/login" className="group flex items-center gap-1">
        <LogIn />
        <span className="group-hover:underline underline-offset-4 max-md:hidden">
          Sign In
        </span>
      </Link>
    );
  }

  const initials = session.user.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : (session.user.email?.slice(0, 2).toUpperCase() ?? '??');

  const handleAction = (key: React.Key) => {
    if (key === 'settings') {
      router.push('/settings');
    } else if (key === 'sign-out') {
      authClient.signOut().then(() => router.push('/'));
    }
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        className="cursor-pointer rounded-full outline-none focus-visible:ring-2"
        aria-label={`User menu for ${session.user.name}`}
      >
        <Avatar size="sm">
          {session.user.image && (
            <Avatar.Image src={session.user.image} alt={session.user.name} />
          )}
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>

      <Dropdown.Popover>
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="settings" textValue="Settings">
            <Label>Settings</Label>
          </Dropdown.Item>
          <Dropdown.Item id="sign-out" textValue="Sign Out" variant="danger">
            <Label>Sign Out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
