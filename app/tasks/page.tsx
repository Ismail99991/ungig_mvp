"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Task = {
  id: number;
  title: string;
  department: string | null;
  task_type: "internal" | "external";
  status: "open" | "assigned" | "done" | "paid";
  hours: number | null;
  payment: number | null;
  assigned_to: string | null;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    setUid(userData.user?.id ?? null);
    const { data, error } = await supabase
      .from("tasks")
      .select("id,title,department,task_type,status,hours,payment,assigned_to")
      .order("id", { ascending: false });
    if (!error && data) setTasks(data as Task[]);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (_payload) => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const takeTask = async (id:number) => {
    if (!uid) return alert("Нужна авторизация");
    const { error } = await supabase.from("tasks").update({ assigned_to: uid, status: "assigned" }).eq("id", id);
    if (error) alert(error.message);
  };
  const doneTask = async (id:number) => {
    const { error } = await supabase.from("tasks").update({ status: "done" }).eq("id", id);
    if (error) alert(error.message);
  };

  return (
    <main>
      <h2>Задачи</h2>
      <div style={{ display:"grid", gap:12 }}>
        {tasks.map(t => (
          <div key={t.id} style={{ border:"1px solid #ddd", borderRadius:8, padding:12 }}>
            <b>#{t.id}</b> — {t.title} [{t.department ?? "—"}] • {t.task_type} • {t.status}
            <div>Время: {t.hours ?? 0} ч — Оплата: {t.payment ?? 0} $</div>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              {t.status === "open" && <button onClick={()=>takeTask(t.id)}>Взять</button>}
              {t.status === "assigned" && <button onClick={()=>doneTask(t.id)}>Готово</button>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
