'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { authService } from '@/lib/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 glass rounded-xl mb-5 hover:shadow-lg hover:shadow-white/10 transition-all">
            <span className="text-foreground font-bold text-2xl tracking-tight">S</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Silk Road</h1>
          <p className="text-muted-foreground text-base mt-3">Enterprise Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-xs font-bold text-foreground uppercase tracking-wider">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="w-full text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="demo123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full text-base"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive border-l-2 border-destructive pl-4 py-3 bg-destructive/5 rounded-r">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold h-11 text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-muted-foreground text-sm">
            Enter your credentials to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
