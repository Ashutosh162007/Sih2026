import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  email: z.string().email("Valid administrative email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@sahayog.in", password: "password" },
  });

  async function onSubmit(values) {
    try {
      const user = await login(values.email.trim(), values.password);
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        useAuthStore.setState({ error: "Access Restricted: This account does not possess state administrative privileges." });
      }
    } catch (_) {}
  }

  function fillAdminDemo() {
    setValue("email", "admin@sahayog.in");
    setValue("password", "password");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0A2E2F] to-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
            <BrandLogo className="h-12 w-12" />
            <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 p-1 text-slate-950 shadow-md">
              <ShieldCheck size={16} />
            </div>
          </div>
        </div>

        <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight text-white">
          State Innovation Command Center
        </h2>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Jharkhand State Higher & Technical Education Oversight Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-3xl border border-slate-700/80 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 p-3.5 text-xs text-emerald-200 flex items-start gap-2.5">
            <ShieldCheck size={18} className="shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300">Authorized Personnel Only</p>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Restricted access for State Innovation Council, HEI Accreditation Auditors, and CSR Tax Authorization Authorities.
              </p>
            </div>
          </div>

          {/* Quick Demo Fill for Admin */}
          <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs">
            <span className="text-slate-300 font-medium">Quick Demo Admin:</span>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="rounded-lg bg-emerald-600/30 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-600/50 transition cursor-pointer"
            >
              Fill Admin Credentials
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Administrative Email
              <input
                {...register("email")}
                type="email"
                placeholder="admin@sahayog.in"
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
              {formState.errors.email && (
                <span className="mt-1 block text-xs text-rose-400">{formState.errors.email.message}</span>
              )}
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Security Password
              <div className="relative mt-1.5">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formState.errors.password && (
                <span className="mt-1 block text-xs text-rose-400">{formState.errors.password.message}</span>
              )}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 cursor-pointer"
            >
              <Lock size={16} />
              {loading ? "Authenticating Authority..." : "Sign In to Admin Command Center"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-300 transition"
            >
              <ArrowLeft size={14} /> Return to Public Sahayog Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
