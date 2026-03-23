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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '~/lib/auth/client';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    const result = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: '/',
    });
    setIsPending(false);
    if (result.error) {
      setError(result.error.message ?? 'Registration failed');
    } else {
      router.push('/');
    }
  };

  const handleSocial = (provider: 'google' | 'discord') => {
    authClient.signIn.social({ provider, callbackURL: '/' });
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Buat Akun</h1>
        <p className="text-sm text-default-500">Bergabung dengan FREENIGAMI</p>
      </div>

      {error && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <TextField
          fullWidth
          isRequired
          type="email"
          value={email}
          onChange={setEmail}
          isDisabled={isPending}
        >
          <Label>Email</Label>
          <Input placeholder="you@example.com" />
          <FieldError />
        </TextField>

        <TextField
          fullWidth
          isRequired
          type="password"
          value={password}
          onChange={setPassword}
          isDisabled={isPending}
        >
          <Label>Password</Label>
          <Input placeholder="Minimal 8 karakter" />
          <FieldError />
        </TextField>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isDisabled={isPending}
        >
          {isPending ? <Spinner size="sm" /> : 'Buat Akun'}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-default-400">atau</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-2">
        <Button
          variant="secondary"
          fullWidth
          onPress={() => handleSocial('google')}
          isDisabled={isPending}
        >
          Lanjutkan dengan Google
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onPress={() => handleSocial('discord')}
          isDisabled={isPending}
        >
          Lanjutkan dengan Discord
        </Button>
      </div>

      <p className="text-center text-sm text-default-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="underline underline-offset-4">
          Masuk
        </Link>
      </p>
    </div>
  );
}
