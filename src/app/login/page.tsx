"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/collections");
    } else {
      setError("E-posta veya şifre hatalı.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <span className="text-4xl font-extrabold tracking-widest" style={{fontFamily:'monospace'}}>LOGO</span>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-gray-700">E-Posta</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="johnsondoe@nomail.com"
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black text-base"
            required
          />
        </div>
        <div className="flex flex-col gap-1 relative">
          <label htmlFor="password" className="text-sm text-gray-700">Şifre</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="****************"
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black text-base pr-12"
            required
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-700"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 16.273 7.24 19.5 12 19.5c1.658 0 3.237-.336 4.646-.94M6.228 6.228A9.956 9.956 0 0112 4.5c4.76 0 8.774 3.227 10.066 7.499a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l12.544 12.544" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.857-.676 1.664-1.186 2.393M15.54 15.54A9.956 9.956 0 0112 19.5c-4.76 0-8.774-3.227-10.066-7.499a10.523 10.523 0 014.293-5.774" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            className="accent-black w-4 h-4 rounded"
          />
          <label htmlFor="remember" className="text-sm text-gray-700 select-none">Beni Hatırla</label>
        </div>
        {error && <div className="text-red-500 text-sm -mt-4">{error}</div>}
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-xl font-semibold text-base mt-2 hover:bg-gray-900 transition"
          disabled={loading}
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
} 