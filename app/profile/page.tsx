"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const [uid, setUid] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [inn, setInn] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) return;
      setUid(u.id);
      setEmail(u.email || "");
      // пробуем вытянуть профиль
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", u.id).maybeSingle();
      if (p) { setInn(p.inn ?? ""); setVerified(!!p.npd_verified); }
      else {
        await supabase.from("profiles").insert({ user_id: u.id, role: "external" });
      }
    });
  }, []);

  const saveInn = async () => {
    await supabase.from("profiles").update({ inn }).eq("user_id", uid);
    alert("ИНН сохранён.");
  };

  const checkNpd = async () => {
    // тут будет вызов серверной функции на Vercel /api/npd-check
    alert("Проверка НПД будет подключена позже (серверная функция).");
  };

  return (
    <main>
      <h2>Профиль</h2>
      <div>Email: <b>{email}</b></div>
      <div style={{ display:"grid", gap:8, maxWidth:300, marginTop:12 }}>
        <input placeholder="ИНН (12 цифр)" value={inn} onChange={e=>setInn(e.target.value)} />
        <button onClick={saveInn}>Сохранить ИНН</button>
        <button onClick={checkNpd}>Проверить НПД</button>
        <div>Статус НПД: {verified ? "подтвержден" : "не подтвержден"}</div>
      </div>
    </main>
  );
}
