import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const homeForRole = useAuthStore((s) => s.homeForRole);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "reporter@civicpulse.in", password: "password" },
  });

  async function onSubmit(values) {
    const user = await login(values.email, values.password);
    navigate(homeForRole(user));
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-3xl text-slate-900">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-500">Sign in to your CivicPulse workspace.</p>
      <button
        type="button"
        className="mt-6 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold"
      >
        Continue with Google
      </button>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or email <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block text-sm">
          Email
          <input
            {...register("email")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
          />
          {formState.errors.email && (
            <span className="text-xs text-rose-600">{formState.errors.email.message}</span>
          )}
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            {...register("password")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        Demo accounts: reporter / university / industry / admin @civicpulse.in — password
      </p>
      <p className="mt-2 text-sm">
        New here?{" "}
        <Link to="/signup" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
