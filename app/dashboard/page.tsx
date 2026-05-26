'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

interface Person {
  first: string;
  last: string;
  email: string;
  gender: string;
  address: string;
  state: string;
  zip: string;
  avatar?: string;
  age?: number;
  bio?: string;
  interests?: string[];
}

const INTERESTS = [
  ['Café ☕', 'Viajes ✈️', 'Música 🎵'],
  ['Yoga 🧘', 'Cocina 👨‍🍳', 'Fotos 📸'],
  ['Gaming 🎮', 'Gym 💪', 'Libros 📚'],
  ['Arte 🎨', 'Cine 🎬', 'Naturaleza 🌿'],
  ['Deportes ⚽', 'Baile 💃', 'Tecnología 💻'],
];

const BIOS = [
  'Buscando a alguien especial para compartir aventuras 🌟',
  'Amante del café y las conversaciones profundas ✨',
  'Viajero empedernido, 30 países visitados 🗺️',
  'Chef de corazón, foodie de profesión 🍕',
  'Fan del deporte y la vida sana 🏃‍♂️',
  'Artista en mis ratos libres, soñador siempre 🎨',
  'Buscando mi persona favorita para el mundo 💫',
  'Amante de los animales y la naturaleza 🐾',
];

const MEN = Array.from({ length: 15 }, (_, i) =>
  `https://randomuser.me/api/portraits/men/${i + 20}.jpg`
);
const WOMEN = Array.from({ length: 15 }, (_, i) =>
  `https://randomuser.me/api/portraits/women/${i + 20}.jpg`
);

export default function DashboardPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [likes, setLikes] = useState(0);
  const [nopes, setNopes] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showMatch, setShowMatch] = useState(false);
  const [matchPerson, setMatchPerson] = useState<Person | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);
      setUserName(session.user.user_metadata?.full_name?.split(' ')[0] || 'Tú');
    });
  }, [router]);

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        'https://randomapi.com/api/6de6abfedb24f889e0b5f675edc50deb?fmt=raw&sole&results=20'
      );
      const data = await res.json();
      const enriched = data.map((p: Person, i: number) => ({
        ...p,
        age: Math.floor(Math.random() * 15) + 22,
        avatar: p.gender === 'male' ? MEN[i % MEN.length] : WOMEN[i % WOMEN.length],
        bio: BIOS[i % BIOS.length],
        interests: INTERESTS[i % INTERESTS.length],
      }));
      setPeople(enriched);
      setCurrent(0);
    } catch {
      console.error('Error fetching');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPeople(); }, [fetchPeople]);

  const handleSwipe = async (liked: boolean) => {
    if (!people[current]) return;
    const person = people[current];
    setSwipeDir(liked ? 'right' : 'left');
    setDragX(0);
    setDragging(false);

    if (liked) {
      setLikes(l => l + 1);
      if (userId) {
        const { data: saved } = await supabase.from('people').insert({
          first_name: person.first, last_name: person.last,
          email: person.email, gender: person.gender,
          city: person.address, country: person.state,
          avatar_url: person.avatar, age: person.age,
        }).select().single();
        if (saved) {
          await supabase.from('swipes').insert({ user_id: userId, person_id: saved.id, liked: true });
          await supabase.from('favorites').insert({ user_id: userId, person_id: saved.id });
        }
      }
      if (Math.random() < 0.35) {
        setMatchPerson(person);
        setTimeout(() => setShowMatch(true), 400);
        setTimeout(() => setShowMatch(false), 3000);
      }
    } else {
      setNopes(n => n + 1);
    }

    setTimeout(() => {
      setSwipeDir(null);
      if (current + 1 >= people.length) fetchPeople();
      else setCurrent(c => c + 1);
    }, 380);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    startX.current = e.clientX;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  };
  const onMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > 80) handleSwipe(true);
    else if (dragX < -80) handleSwipe(false);
    else setDragX(0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const person = people[current];
  const next1 = people[current + 1];
  const next2 = people[current + 2];
  const cardRotate = dragging ? dragX * 0.08 : 0;
  const likeOpacity = Math.min(Math.max(dragX / 80, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dragX / 80, 0), 1);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes matchIn { 0%{opacity:0;transform:scale(0.7)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes floatUp { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
        .action-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .action-btn:hover { transform: scale(1.12) !important; }
        .action-btn:active { transform: scale(0.92) !important; }
      `}</style>

      {/* HEADER */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem 0.75rem',
      }}>
        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 14, padding: '8px 14px', color: 'rgba(255,255,255,0.7)',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
        }}>← Salir</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 26 }}>🔥</span>
          <span style={{
            fontSize: 30, fontWeight: 900, letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #FE3C72 0%, #FF8C42 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Tinder</span>
        </div>

        <Link href="/profile" style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 14, padding: '8px 14px', color: 'rgba(255,255,255,0.7)',
          fontSize: 13, fontWeight: 600,
        }}>👤 Yo</Link>
      </header>

      {/* STATS */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, padding: '0.4rem 1rem',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,107,107,0.15)', borderRadius: 20,
          padding: '4px 14px', border: '1px solid rgba(255,107,107,0.3)',
        }}>
          <span style={{ fontSize: 15 }}>❌</span>
          <span style={{ color: '#ff8aab', fontWeight: 800, fontSize: 14 }}>{nopes}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600 }}>
          Hola, {userName}
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(66,230,149,0.15)', borderRadius: 20,
          padding: '4px 14px', border: '1px solid rgba(66,230,149,0.3)',
        }}>
          <span style={{ fontSize: 15 }}>💚</span>
          <span style={{ color: '#42e695', fontWeight: 800, fontSize: 14 }}>{likes}</span>
        </div>
      </div>

      {/* CARD STACK */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0.5rem 1rem', position: 'relative', minHeight: 480,
      }}>
        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, border: '4px solid #FE3C72',
              borderTop: '4px solid transparent', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Nunito,sans-serif' }}>
              Cargando 20 perfiles...
            </p>
          </div>
        ) : !person ? (
          <div style={{ textAlign: 'center', animation: 'floatUp 0.4s ease' }}>
            <p style={{ fontSize: 56, marginBottom: 12 }}>😔</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontFamily: 'Nunito,sans-serif' }}>
              No hay más perfiles
            </p>
            <button onClick={fetchPeople} style={{
              background: 'linear-gradient(135deg, #FE3C72, #FF8C42)',
              border: 'none', borderRadius: 20, padding: '14px 32px',
              color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'Nunito,sans-serif', cursor: 'pointer',
            }}>Cargar más 🔄</button>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', maxWidth: 360, height: 490 }}>

            {next2 && (
              <div style={{
                position: 'absolute', top: 18, left: '50%',
                transform: 'translateX(-50%) scale(0.87)',
                width: '100%', height: 470, borderRadius: 24,
                background: '#1e2a4a', border: '1px solid rgba(255,255,255,0.05)',
              }} />
            )}

            {next1 && (
              <div style={{
                position: 'absolute', top: 9, left: '50%',
                transform: 'translateX(-50%) scale(0.93)',
                width: '100%', height: 470, borderRadius: 24, overflow: 'hidden',
              }}>
                <img src={next1.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
              </div>
            )}

            <div
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{
                position: 'absolute', top: 0, left: '50%',
                transform: swipeDir === 'right'
                  ? `translateX(calc(-50% + 160%)) rotate(28deg)`
                  : swipeDir === 'left'
                    ? `translateX(calc(-50% - 160%)) rotate(-28deg)`
                    : `translateX(calc(-50% + ${dragX}px)) rotate(${cardRotate}deg)`,
                transition: swipeDir ? 'transform 0.38s cubic-bezier(0.5,0,1,0.5)' : dragging ? 'none' : 'transform 0.25s ease',
                width: '100%', height: 470, borderRadius: 24,
                overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                boxShadow: '0 28px 70px rgba(0,0,0,0.6)',
              }}
            >
              <img
                src={person.avatar} alt={person.first}
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                draggable={false}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)',
              }} />

              <div style={{
                position: 'absolute', top: 36, left: 20,
                border: '4px solid #42e695', borderRadius: 10,
                padding: '6px 18px', color: '#42e695', fontWeight: 900,
                fontSize: 32, transform: 'rotate(-22deg)',
                opacity: likeOpacity, fontFamily: 'Nunito,sans-serif',
              }}>LIKE</div>

              <div style={{
                position: 'absolute', top: 36, right: 20,
                border: '4px solid #FE3C72', borderRadius: 10,
                padding: '6px 18px', color: '#FE3C72', fontWeight: 900,
                fontSize: 32, transform: 'rotate(22deg)',
                opacity: nopeOpacity, fontFamily: 'Nunito,sans-serif',
              }}>NOPE</div>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <h2 style={{
                    fontSize: 30, fontWeight: 900, color: '#fff', margin: 0, fontFamily: 'Nunito,sans-serif',
                  }}>
                    {person.first} {person.last}
                  </h2>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                    {person.age}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8, fontFamily: 'Nunito,sans-serif' }}>
                  📍 {person.address}, {person.state}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 12, fontFamily: 'Nunito,sans-serif', lineHeight: 1.4 }}>
                  {person.bio}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {person.interests?.map(tag => (
                    <span key={tag} style={{
                      background: 'rgba(255,255,255,0.18)', borderRadius: 20,
                      padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#fff',
                      fontFamily: 'Nunito,sans-serif', border: '1px solid rgba(255,255,255,0.2)',
                    }}>{tag}</span>
                  ))}
                  <span style={{
                    background: 'rgba(254,60,114,0.25)', borderRadius: 20,
                    padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#ffaac7',
                    fontFamily: 'Nunito,sans-serif', border: '1px solid rgba(254,60,114,0.3)',
                  }}>
                    {person.gender === 'male' ? '♂ Hombre' : '♀ Mujer'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              position: 'absolute', bottom: -26, left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Nunito,sans-serif', whiteSpace: 'nowrap',
            }}>
              {current + 1} / {people.length} perfiles
            </div>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      {!loading && person && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 14, padding: '1.25rem 1rem 0.5rem',
          }}>
            <button className="action-btn" onClick={() => handleSwipe(false)} style={{
              width: 62, height: 62, borderRadius: '50%',
              background: 'rgba(20,20,40,0.8)', border: '2px solid rgba(255,80,80,0.6)',
              fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(254,60,114,0.25)', cursor: 'pointer',
            }}>❌</button>

            <button className="action-btn" onClick={() => handleSwipe(false)} style={{
              width: 50, height: 50, borderRadius: '50%',
              background: 'rgba(20,20,40,0.8)', border: '2px solid rgba(0,191,255,0.5)',
              fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,191,255,0.2)', cursor: 'pointer',
            }}>⭐</button>

            <button className="action-btn" onClick={() => handleSwipe(true)} style={{
              width: 74, height: 74, borderRadius: '50%',
              background: 'linear-gradient(135deg, #42e695 0%, #3bb2b8 100%)',
              border: 'none', fontSize: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(66,230,149,0.5)', cursor: 'pointer',
            }}>💚</button>

            <button className="action-btn" onClick={() => setCurrent(c => Math.max(0, c - 1))} style={{
              width: 50, height: 50, borderRadius: '50%',
              background: 'rgba(20,20,40,0.8)', border: '2px solid rgba(255,215,0,0.5)',
              fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255,215,0,0.15)', cursor: 'pointer',
            }}>↩️</button>

            <button className="action-btn" onClick={fetchPeople} style={{
              width: 62, height: 62, borderRadius: '50%',
              background: 'rgba(20,20,40,0.8)', border: '2px solid rgba(160,100,255,0.5)',
              fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(160,100,255,0.25)', cursor: 'pointer',
            }}>⚡</button>
          </div>

          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.2)',
            fontSize: 11, fontFamily: 'Nunito,sans-serif', margin: '4px 0 8px',
          }}>
            ← arrastra o usa los botones →
          </p>
        </>
      )}

      {/* BOTTOM NAV */}
      <nav style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '0.85rem 0 1.1rem',
        background: 'rgba(0,0,0,0.35)',
      }}>
        {[
          { href: '/dashboard', icon: '🔥', label: 'Discover', active: true },
          { href: '/favorites', icon: '⭐', label: 'Likes', active: false },
          { href: '/search', icon: '🔍', label: 'Buscar', active: false },
          { href: '/profile', icon: '👤', label: 'Perfil', active: false },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            textAlign: 'center', textDecoration: 'none',
            color: item.active ? '#FE3C72' : 'rgba(255,255,255,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: item.active ? 800 : 500, fontFamily: 'Nunito,sans-serif' }}>
              {item.label}
            </span>
            {item.active && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FE3C72' }} />
            )}
          </Link>
        ))}
      </nav>

      {/* MATCH OVERLAY */}
      {showMatch && matchPerson && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.93)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'matchIn 0.4s ease',
          fontFamily: 'Nunito,sans-serif',
        }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 2 }}>¡Tienes un nuevo</p>
          <h2 style={{
            fontSize: 56, fontWeight: 900, margin: '0 0 6px',
            background: 'linear-gradient(135deg, #FE3C72, #FF8C42)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Match!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 24 }}>
            A {matchPerson.first} también le gustas 💕
          </p>
          <img src={matchPerson.avatar} alt="" style={{
            width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
            border: '4px solid #FE3C72', boxShadow: '0 0 40px rgba(254,60,114,0.5)',
          }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button onClick={() => setShowMatch(false)} style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 25, padding: '13px 24px', color: '#fff',
              fontWeight: 700, fontSize: 14, fontFamily: 'Nunito,sans-serif', cursor: 'pointer',
            }}>Seguir viendo</button>
            <button onClick={() => setShowMatch(false)} style={{
              background: 'linear-gradient(135deg, #FE3C72, #FF8C42)', border: 'none',
              borderRadius: 25, padding: '13px 24px', color: '#fff',
              fontWeight: 900, fontSize: 14, fontFamily: 'Nunito,sans-serif', cursor: 'pointer',
            }}>Enviar mensaje 💬</button>
          </div>
        </div>
      )}
    </div>
  );
}