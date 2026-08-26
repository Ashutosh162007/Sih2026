import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { ROLES, ROLE_LABELS } from "../lib/constants";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  org: z.string().optional(),
  role: z.enum([ROLES.REPORTER, ROLES.UNIVERSITY, ROLES.INDUSTRY]),
});

export default function Signup() {
  const registerUser = useAuthStore((s) => s.register);
  const login = useAuthStore((s) => s.login);
  const homeForRole = useAuthStore((s) => s.homeForRole);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: ROLES.REPORTER },
  });
  const role = watch("role");

  async function onSubmit(values) {
    const user = await registerUser(values);
    if (user.status === "pending") {
      navigate("/signup/pending");
      return;
    }
    const session = await login(values.email, values.password);
    navigate(homeForRole(session));
  }

  return (
    <AuthLayout headline="Join the civic innovation network">
      <h2 className="font-display text-3xl text-slate-900">Create account</h2>
      <p className="mt-2 text-sm text-slate-500">Universities and industry partners are verified by Admin.</p>
      <button type="button" className="mt-6 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold">
        Continue with Google
      </button>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or email <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block text-sm">
          Full name
          <input
            {...register("name")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          Role
          <select
            {...register("role")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
          >
            {[ROLES.REPORTER, ROLES.UNIVERSITY, ROLES.INDUSTRY].map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        {(role === ROLES.UNIVERSITY || role === ROLES.INDUSTRY) && (
          <label className="block text-sm">
            Organisation
            <input
              {...register("org")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        )}
        <label className="block text-sm">
          Email
          <input
            {...register("email")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            {...register("password")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        {formState.errors.name && <p className="text-xs text-rose-600">Please complete required fields.</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
