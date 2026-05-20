import { useState } from 'react';
import { api } from '../lib/eden';

interface GuestbookFormProps {
  onSuccess: () => void;
}

export default function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const message = formData.get("message") as string;

    try {
      const result = await api.api.guestbook.post({ username, message });

      if (result.data && (result.data as { success?: boolean }).success) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
        onSuccess();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        const data = result.data as { error?: string } | null;
        setErrorMsg(data?.error || result.error?.message || "An error occurred");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <form id="guestbook-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          name="username"
          placeholder="USERNAME"
          required
          maxLength={20}
          aria-label="Your username"
          className="bg-white dark:bg-zinc-800 border-4 border-black dark:border-white/20 p-2 font-black uppercase focus:outline-none focus:bg-yellow-100 dark:focus:bg-zinc-700 flex-shrink-0 w-full sm:w-48"
        />
        <input
          name="message"
          placeholder="TYPE YOUR MESSAGE..."
          required
          maxLength={100}
          aria-label="Your message"
          className="bg-white dark:bg-zinc-800 border-4 border-black dark:border-white/20 p-2 font-black uppercase focus:outline-none focus:bg-yellow-100 dark:focus:bg-zinc-700 flex-1"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 font-black uppercase hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "SENDING..." : "POST"}
        </button>
      </div>
      {status === "success" && <p className="text-green-600 font-black uppercase italic">Message transmitted successfully!</p>}
      {status === "error" && <p className="text-red-600 font-black uppercase italic">{errorMsg}</p>}
    </form>
  );
}
