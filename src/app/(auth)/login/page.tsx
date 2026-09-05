'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form-elements';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const OPERATOR_ACCOUNTS = [
  { username: 'ren', label: 'Ren' },
  { username: 'opsnal', label: 'Opsnal' },
  { username: 'tekpol', label: 'Tekpol' },
  { username: 'dokinfo', label: 'Dokinfo' },
  { username: 'kerma', label: 'Kerma' },
  { username: 'urkeu', label: 'Urkeu' },
  { username: 'taud', label: 'Taud' },
  { username: 'gasbin', label: 'Gasbin' },
  { username: 'rikuwastu', label: 'Rikwasa' },
  { username: 'sumda.logistik', label: 'Sumda L' },
];

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSelectAccount(uname: string, label: string) {
    setUsername(uname);
    setPassword('sprin2024');
    setError('');
    toast.info(`Akun Divisi ${label} Dipilih`, {
      description: 'Kredensial otomatis terisi. Klik "Masuk ke Sistem".',
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
        toast.success('Login berhasil!', { description: 'Mengalihkan ke Dashboard SPRIN...' });
        router.push('/dashboard');
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-[#070D1B]">
      {/* ─────────────────────────────────────────────────────────────
          BACKGROUND: Tactical Deep Navy Gradient + Mesh Tech Grid
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B18] via-[#0A1428] to-[#060B18] pointer-events-none" />

      {/* Subtle Tech Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_65%,transparent_100%)] pointer-events-none" 
      />

      {/* Ambient Lighting Accents */}
      <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT WRAPPER (Symmetrical & Focused)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[480px] relative z-10 my-auto flex flex-col items-center">
        
        {/* 1. PENATAAN BAGIAN ATAS: Header & Logo Simetris */}
        <div className="flex flex-col items-center text-center mb-7">
          {/* Logo Puslitbang dengan Subtle Frame */}
          <div className="relative mb-3.5 group">
            <div className="absolute -inset-1 rounded-2xl bg-amber-400/20 blur-sm opacity-50 group-hover:opacity-80 transition duration-300" />
            <div className="relative flex items-center justify-center w-20 h-24 rounded-2xl bg-[#111827]/90 border border-white/10 p-2 shadow-xl">
              <Image
                src="/logo-puslitbang.png"
                alt="Logo Puslitbang Polri"
                width={70}
                height={80}
                className="object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>
          </div>

          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium tracking-wider text-amber-300/90 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase">Puslitbang Polri</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SISTEM SPRIN
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-normal max-w-sm">
            Sistem Informasi Surat Perintah Tugas Personel
          </p>
        </div>

        {/* 2. KARTU LOGIN UTAMA: Solid #161F30, Radius 20px, Subtle Shadow */}
        <div className="w-full bg-[#161F30] rounded-[20px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/[0.07]">
          
          {/* Card Header Status */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
            <div>
              <h2 className="text-white text-base font-bold tracking-wide">Portal Autentikasi</h2>
              <p className="text-xs text-slate-400 mt-0.5">Silakan masuk menggunakan akun operator</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-300">SISTEM SIAP</span>
            </div>
          </div>

          {/* 3. INPUT FORM: Konsisten, Background #0C1322, Focus Glow */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
            {/* Field Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Username Operator
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username operator..."
                  required
                  className="h-12 pl-11 pr-4 bg-[#0C1322] border border-white/10 focus:border-[#EAB308] focus:ring-2 focus:ring-[#EAB308]/25 text-white placeholder:text-slate-500 text-sm rounded-xl transition-all duration-200"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Kata Sandi
                </Label>
                <span className="text-[11px] text-slate-400 font-mono">Default: sprin2024</span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 pl-11 pr-4 bg-[#0C1322] border border-white/10 focus:border-[#EAB308] focus:ring-2 focus:ring-[#EAB308]/25 text-white placeholder:text-slate-500 text-sm rounded-xl transition-all duration-200 font-mono"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Alert Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Tombol Utama: Emas Polri (#FFB100 / #EAB308), Teks Hitam Bold */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-2 rounded-xl bg-[#FFB100] hover:bg-[#FFBE1A] active:scale-[0.99] text-slate-950 font-bold text-sm tracking-wide shadow-[0_4px_16px_rgba(255,177,0,0.25)] hover:shadow-[0_6px_22px_rgba(255,177,0,0.4)] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </span>
              )}
            </Button>
          </form>

          {/* 4. FITUR QUICK LOGIN: Kompartemen Terstruktur Grid 5-Kolom Presisi */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pilih Akun Operator (Quick Login)
              </span>
              <span className="text-[10px] text-amber-400/90 font-medium px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                10 Unit Kerja
              </span>
            </div>

            {/* Grid 5 Kolom Konstan dengan Dimensi Tombol Sama Persis */}
            <div className="grid grid-cols-5 gap-2">
              {OPERATOR_ACCOUNTS.map((acc) => {
                const isSelected = username === acc.username;
                return (
                  <button
                    type="button"
                    key={acc.username}
                    onClick={() => handleSelectAccount(acc.username, acc.label)}
                    className={`h-9 w-full rounded-lg text-[11px] font-semibold transition-all duration-150 flex items-center justify-center cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)] font-bold scale-[1.02]'
                        : 'bg-[#0C1322]/80 hover:bg-white/[0.09] border-white/[0.08] hover:border-amber-400/40 text-slate-200 hover:text-white'
                    }`}
                    title={`Masuk sebagai ${acc.label} (${acc.username})`}
                  >
                    <span className="truncate px-1">{acc.label}</span>
                  </button>
                );
              })}
            </div>
            
            <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-slate-500" />
              <span>Klik salah satu divisi untuk pengisian username & password otomatis</span>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6 text-slate-400 text-xs">
          <p className="font-medium text-slate-300">Pusat Penelitian dan Pengembangan Polri</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            © {new Date().getFullYear()} Sistem SPRIN. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
