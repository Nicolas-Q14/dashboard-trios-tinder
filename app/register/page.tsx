'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--tinder-dark)', padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>✨</div>
          <h1 style={{
            fontSize: 36, fontWeight: 900, letterSpacing: '-1px',
            background: 'linear-gradient(135deg, var(--tinder-red), var(--tinder-orange))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>trios</h1>
          <p style={{ color: 'var(--tinder-muted)', fontSize: 14, marginTop: 4 }}>
            Únete y encuentra tu match 💫
          </p>
        </div>

        <div style={{
          background: 'var(--tinder-darker)', borderRadius: 24,
          padding: '2rem', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Crear cuenta</h2>
          <p style={{ color: 'var(--tinder-muted)', fontSize: 13, marginBottom: 24 }}>
            Empieza a hacer swipe hoy
          </p>

          {error && (
            <div style={{
              background: 'rgba(254,60,114,0.15)', border: '1px solid var(--tinder-red)',
              borderRadius: 12, padding: '10px 16px', marginBottom: 16,
              color: '#ff8aab', fontSize: 13
            }}>{error}</div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="text" placeholder="👤  Tu nombre" value={fullName}
              onChange={e => setFullName(e.target.value)} required
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none', width: '100%'
              }}
            />
            <input
              type="email" placeholder="📧  tu@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none', width: '100%'
              }}
            />
            <input
              type="password" placeholder="🔒  Contraseña (mín. 6 caracteres)" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={6}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none', width: '100%'
              }}
            />

            <button type="submit" disabled={loading} style={{
              background: loading ? '#555' : 'linear-gradient(135deg, var(--tinder-red), var(--tinder-orange))',
              border: 'none', borderRadius: 14, padding: '15px',
              color: '#fff', fontWeight: 800, fontSize: 16, marginTop: 4,
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
            }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta 🚀'}
            </button>
          </form>

          <div style={{ marginTop: 20, color: 'var(--tinder-muted)', fontSize: 14 }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--tinder-red)', fontWeight: 700 }}>
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}