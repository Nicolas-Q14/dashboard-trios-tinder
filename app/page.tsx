'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
      else router.push('/login');
    });
  }, [router]);

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--tinder-dark)'
    }}>
      <div style={{
        width: 48, height: 48, border: '4px solid var(--tinder-red)',
        borderTop: '4px solid transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}