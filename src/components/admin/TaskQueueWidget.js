"use client";

import { useState } from "react";
import { createAdminTask, toggleTaskStatus, deleteAdminTask } from "@/app/admin/taskActions";

export default function TaskQueueWidget({ initialTasks = [] }) {
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("title", newTitle);

    const res = await createAdminTask(formData);
    if (!res.success) {
      setErrorMsg(res.error);
    } else {
      setNewTitle("");
    }
    setSubmitting(false);
  };

  const handleToggle = async (id, currentStatus) => {
    const res = await toggleTaskStatus(id, currentStatus);
    if (!res.success) {
      setErrorMsg(res.error);
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteAdminTask(id);
    if (!res.success) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            System Backlog
          </span>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-ink">
            Pending Tasks Queue
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {initialTasks.filter((t) => t.status !== "completed").length} Pending
        </span>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleAdd} className="mt-5 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Log new operational task..."
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-ink placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-ink px-5 py-2.5 text-xs font-bold text-white hover:bg-moss-800 transition-colors disabled:opacity-50"
        >
          Add Task
        </button>
      </form>

      <ul className="mt-5 divide-y divide-slate-100">
        {initialTasks.length === 0 ? (
          <li className="py-6 text-center text-xs font-medium text-slate-400">
            No active system tasks. Queue is clear.
          </li>
        ) : (
          initialTasks.map((task) => {
            const isDone = task.status === "completed";
            return (
              <li
                key={task.id}
                className="flex items-center justify-between py-3 gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id, task.status)}
                    className={`h-5 w-5 rounded-md border flex items-center justify-center text-xs transition-colors ${
                      isDone
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white text-transparent hover:border-emerald-600"
                    }`}
                  >
                    ✓
                  </button>
                  <span
                    className={`text-xs font-semibold truncate ${
                      isDone ? "line-through text-slate-400" : "text-slate-700"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-xs text-slate-400 hover:text-red-600 transition-colors font-bold px-2"
                >
                  Delete
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
