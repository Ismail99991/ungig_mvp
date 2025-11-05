"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password: pwd });
    if (error) alert(error.message); else alert("Проверь почту для подтверждения (если включено).");
  };
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    if (error) alert(error.message);
  };
  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <main>
      <h1>Gig Factory MVP</h1>
      {!user ? (
        <div style={{ display:"grid", gap:8, maxWidth:320 }}>
          <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <button onClick={signUp}>Регистрация</button>
          <button onClick={signIn}>Войти</button>
        </div>
      ) : (
        <div style={{ display:"grid", gap:8 }}>
          <div>Вы вошли как: <b>{user.email}</b></div>
          <div style={{ display:"flex", gap:12 }}>
            <Link href="/tasks">Задачи</Link>
            <Link href="/profile">Профиль</Link>
          </div>
          <button onClick={signOut}>Выйти</button>
        </div>
      )}
    </main>
  );
}
