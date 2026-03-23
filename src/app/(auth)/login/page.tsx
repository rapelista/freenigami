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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/',
    });
    setIsPending(false);
    if (result.error) {
      setError(result.error.message ?? 'Sign in failed');
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
        <h1 className="text-2xl font-semibold">Sign In</h1>
        <p className="text-sm text-default-500">Welcome back to FREENIGAMI</p>
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
          <Input placeholder="••••••••" />
          <FieldError />
        </TextField>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isDisabled={isPending}
        >
          {isPending ? <Spinner size="sm" /> : 'Sign In'}
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
        Belum punya akun?{' '}
        <Link href="/register" className="underline underline-offset-4">
          Daftar
        </Link>
      </p>
    </div>
  );
}
