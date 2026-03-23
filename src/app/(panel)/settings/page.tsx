'use client';

import {
  Alert,
  Button,
  FieldError,
  Input,
  Label,
  Separator,
  Spinner,
  TextField,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { authClient } from '~/lib/auth/client';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (session?.user.name) {
      setName(session.user.name);
    }
  }, [session?.user.name]);

  if (sessionLoading) {
    return (
      <main className="container mx-auto p-4 md:p-6 flex justify-center">
        <Spinner />
      </main>
    );
  }

  if (!session?.user || session.user.isAnonymous) {
    router.push('/login');
    return null;
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsPending(true);
    const result = await authClient.updateUser({ name });
    setIsPending(false);
    if (result.error) {
      setError(result.error.message ?? 'Update gagal');
    } else {
      setSuccess(true);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  return (
    <main className="container mx-auto p-4 md:p-6 max-w-lg space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-default-500 mt-1">Kelola profil kamu</p>
      </div>

      {error && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {success && (
        <Alert status="success">
          <Alert.Content>
            <Alert.Description>Profil berhasil diperbarui.</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Profil</h2>
        <form onSubmit={handleUpdateName} className="space-y-4">
          <TextField fullWidth isDisabled>
            <Label>Email</Label>
            <Input value={session.user.email} readOnly />
            <FieldError />
          </TextField>

          <TextField
            fullWidth
            isRequired
            value={name}
            onChange={setName}
            isDisabled={isPending}
          >
            <Label>Nama Tampilan</Label>
            <Input placeholder="Nama kamu" />
            <FieldError />
          </TextField>

          <Button type="submit" variant="primary" isDisabled={isPending}>
            {isPending ? <Spinner size="sm" /> : 'Simpan Perubahan'}
          </Button>
        </form>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Akun</h2>
        <p className="text-sm text-default-500">
          Masuk sebagai{' '}
          <span className="font-medium text-default-900">
            {session.user.email}
          </span>
        </p>
        <Button variant="danger" onPress={handleSignOut}>
          Keluar
        </Button>
      </section>
    </main>
  );
}
