import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../layouts/AuthLayout";
import { ROLES, ROLE_LABELS, JHARKHAND_DISTRICTS } from "../lib/constants";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  org: z.string().optional(),
  district: z.string().optional(),
  role: z.enum([ROLES.REPORTER, ROLES.UNIVERSITY, ROLES.INDUSTRY]),
});

export default function Signup() {
  const registerUser = useAuthStore((s) => s.register);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const homeForRole = useAuthStore((s) => s.homeForRole);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: ROLES.REPORTER, district: "Ranchi" },
  });
  const role = watch("role");
  const district = watch("district");
  const org = watch("org");
  const name = watch("name");

  async function onSubmit(values) {
    const user = await registerUser(values);
    navigate(homeForRole(user));
  }

  async function handleGoogleSuccess(credentialResponse) {
    if (credentialResponse.credential) {
      try {
        const user = await googleLogin({
          credential: credentialResponse.credential,
          role,
          district: district || "Ranchi",
          org,
          name,
        });
        if (user.status === "pending") {
          navigate("/signup/pending");
          return;
        }
        navigate(homeForRole(user));
      } catch (err) {
        // Handled in store
      }
    }
  }

  return (
    <AuthLayout headline="Join the Sahayog Innovation Network">
      <h2 className="font-display text-3xl font-bold text-slate-900">Create account</h2>
      <p className="mt-1 text-sm text-slate-500">
        Citizens get instant access; University and Industry accounts undergo verification.
      </p>

      {/* Google Sign-up Button */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error("Google Sign-up Error");
            }}
            useOneTap
            shape="rectangular"
            theme="outline"
            size="large"
            text="signup_with"
            width="100%"
          />
        </div>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or register with email <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Full Name / Representative Name
          <input
            {...register("name")}
            placeholder="e.g. Dr. Kavita Rao / Asha Menon"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          />
          {formState.errors.name && <p className="text-xs text-rose-600 mt-1">{formState.errors.name.message}</p>}
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Role Type
          <select
            {...register("role")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          >
            {[ROLES.REPORTER, ROLES.UNIVERSITY, ROLES.INDUSTRY].map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>

        {(role === ROLES.UNIVERSITY || role === ROLES.INDUSTRY) && (
          <label className="block text-sm font-medium text-slate-700">
            Institution / Enterprise Name
            <input
              {...register("org")}
              placeholder={role === ROLES.UNIVERSITY ? "e.g. BIT Mesra / NIT Jamshedpur" : "e.g. Tata Steel CSR"}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-700">
          District (Jharkhand)
          <select
            {...register("district")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          >
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Email address
          <input
            {...register("email")}
            placeholder="e.g. user@sahayog.in"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          />
          {formState.errors.email && <p className="text-xs text-rose-600 mt-1">{formState.errors.email.message}</p>}
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            {...register("password")}
            placeholder="At least 6 characters"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          />
          {formState.errors.password && <p className="text-xs text-rose-600 mt-1">{formState.errors.password.message}</p>}
        </label>

        {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-600">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-[#0E4B4C] py-3 text-sm font-semibold text-white shadow-md shadow-[#0E4B4C]/20 transition hover:bg-[#0b3b3c] disabled:opacity-60"
        >
          {loading ? "Registering account..." : "Join Sahayog Network"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-[#0E4B4C] hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
