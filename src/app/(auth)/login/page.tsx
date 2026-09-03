'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form-elements';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const OPERATOR_ACCOUNTS = [
  { username: 'ren', label: 'Ren' },
  { username: 'opsnal', label: 'Opsnal' },
  { username: 'tekpol', label: 'Tekpol' },
  { username: 'dokinfo', label: 'Dokinfo' },
  { username: 'kerma', label: 'Kerma' },
  { username: 'urkeu', label: 'Urkeu' },
  { username: 'taud', label: 'Taud' },
  { username: 'gasbin', label: 'Gasbin' },
  { username: 'rikuwastu', label: 'Rikuwastu' },
  { username: 'sumda.logistik', label: 'Sumda Log' },
];

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSelectAccount(uname: string) {
    setUsername(uname);
    setPassword('sprin2024');
    setError('');
    toast.info(`Akun "${uname}" dipilih`, {
      description: 'Password telah diisi otomatis. Klik tombol Masuk.',
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Username atau password tidak sesuai.');
        toast.error('Login gagal', { description: 'Periksa kembali username dan password Anda' });
      } else {
        toast.success('Login berhasil!', { description: 'Mengalihkan ke Dashboard...' });
        router.push('/dashboard');
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#060d1d]">
      {/* ─────────────────────────────────────────────────────────────
          BACKGROUND: Deep Navy Gradient + Pola Geometris + Mesh Glow
      ───────────────────────────────────────────────────────────── */}
      {/* Mesh gradients */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#050b18] via-[#0a1838] to-[#07132c] pointer-events-none" />
      
      {/* Grid Pattern Geometris Halus */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Radial Ambient Glow Spheres */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-indigo-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-amber-400/8 blur-[130px] pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          KARTU LOGIN: Modern Glassmorphism Card
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[440px] relative z-10 my-auto">
        {/* Header Branding */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Logo Puslitbang dengan Glow Aura */}
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400/40 via-blue-500/30 to-indigo-500/40 blur-md opacity-75" />
            <div className="relative flex items-center justify-center w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 p-2.5 shadow-2xl">
              <Image
                src="/logo-puslitbang.png"
                alt="Logo Puslitbang Polri"
                width={76}
                height={86}
                className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                priority
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-[11px] font-medium tracking-wider text-amber-300 uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Pusat Penelitian dan Pengembangan Polri</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            SISTEM SPRIN
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-1 font-normal">
            Sistem Informasi Surat Perintah Tugas Personel
          </p>
        </div>

        {/* Card Body Glassmorphism */}
        <div className="backdrop-blur-2xl bg-white/[0.07] border border-white/[0.18] rounded-3xl p-6 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)]">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
            <div>
              <h2 className="text-white text-lg font-bold">Masuk Portal</h2>
              <p className="text-xs text-slate-300/70">Akses khusus operator & staf berwenang</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Input Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-white font-semibold text-xs tracking-wide uppercase">
                Username
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80 transition-colors group-focus-within:text-amber-300" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username operator..."
                  required
                  className="h-12 pl-10 pr-4 bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-white placeholder:text-slate-400 text-sm rounded-xl transition-all duration-200 shadow-inner"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white font-semibold text-xs tracking-wide uppercase">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80 transition-colors group-focus-within:text-amber-300" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 pl-10 pr-4 bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-white placeholder:text-slate-400 text-sm rounded-xl transition-all duration-200 shadow-inner font-mono"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Alert Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Tombol Login Berwarna Solid Kontras (Emas Bhayangkara) */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  Memverifikasi Akun...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* ─────────────────────────────────────────────────────────────
              AKUN OPERATOR TERSEDIA (Chips / Badges Interaktif)
          ───────────────────────────────────────────────────────────── */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pilih Akun Operator (Quick Login)
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono">
                PW: sprin2024
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {OPERATOR_ACCOUNTS.map((acc) => {
                const isSelected = username === acc.username;
                return (
                  <button
                    type="button"
                    key={acc.username}
                    onClick={() => handleSelectAccount(acc.username)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 text-center cursor-pointer active:scale-95 border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                        : 'bg-white/[0.06] hover:bg-white/[0.14] border-white/10 text-slate-200 hover:text-white hover:border-white/25'
                    }`}
                    title={`Masuk sebagai ${acc.label} (${acc.username})`}
                  >
                    <span className="truncate block font-mono text-[11px]">{acc.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-center text-slate-400/70 mt-2.5">
              Klik salah satu tombol divisi di atas untuk pengisian instan
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6 text-slate-400/60 text-[11px]">
          <p>© {new Date().getFullYear()} Puslitbang Polri. Hak Cipta Dilindungi.</p>
          <p className="mt-0.5">Sastra Jendra Satyawadi Kautaman</p>
        </div>
      </div>
    </div>
  );
}
