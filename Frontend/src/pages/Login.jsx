import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../layouts/AuthLayout";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/languageStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const homeForRole = useAuthStore((s) => s.homeForRole);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "citizen@sahayog.in", password: "password" },
  });

  async function onSubmit(values) {
    const user = await login(values.email, values.password);
    navigate(homeForRole(user));
  }

  async function handleGoogleSuccess(credentialResponse) {
    if (credentialResponse.credential) {
      try {
        const user = await googleLogin(credentialResponse.credential);
        navigate(homeForRole(user));
      } catch (err) {
        // Handled in store
      }
    }
  }

  function quickLogin(email) {
    setValue("email", email);
    setValue("password", "password");
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-3xl font-bold text-slate-900">{t("welcomeBack")}</h2>
      <p className="mt-1.5 text-sm text-slate-500">{t("signInWorkspace")}</p>

      {/* Google Sign-in Button */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error("Google Login Error");
            }}
            useOneTap
            shape="rectangular"
            theme="outline"
            size="large"
            text="continue_with"
            width="100%"
          />
        </div>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> {t("continueCredentials")} <span className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Quick Demo Selector */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-600 mb-2">{t("quickDemoSwitcher")}</p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => quickLogin("citizen@sahayog.in")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 cursor-pointer"
          >
            👤 {t("citizen")}
          </button>
          <button
            type="button"
            onClick={() => quickLogin("university@sahayog.in")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 cursor-pointer"
          >
            🎓 {t("university")}
          </button>
          <button
            type="button"
            onClick={() => quickLogin("industry@sahayog.in")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 cursor-pointer"
          >
            🏢 {t("industry")}
          </button>
          <button
            type="button"
            onClick={() => quickLogin("admin@sahayog.in")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 cursor-pointer"
          >
            🛡️ {t("admin")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          {t("emailAddress")}
          <input
            {...register("email")}
            type="email"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm normal-case text-slate-900 outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          />
          {formState.errors.email && (
            <span className="mt-1 block text-xs text-rose-600">{formState.errors.email.message}</span>
          )}
        </label>

        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          {t("password")}
          <input
            {...register("password")}
            type="password"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm normal-case text-slate-900 outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          />
          {formState.errors.password && (
            <span className="mt-1 block text-xs text-rose-600">{formState.errors.password.message}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0E4B4C] py-3 text-sm font-bold text-white shadow-md shadow-[#0E4B4C]/25 transition hover:bg-[#0b3b3c] disabled:opacity-50 cursor-pointer"
        >
          {loading ? t("signingIn") : t("signInToDashboard")}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        {t("newToSahayog")}{" "}
        <Link to="/signup" className="font-semibold text-[#0E4B4C] hover:underline">
          {t("createAnAccount")}
        </Link>
      </p>
    </AuthLayout>
  );
}
