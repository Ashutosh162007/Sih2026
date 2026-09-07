import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Check, X, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { ROLES, ROLE_LABELS, JHARKHAND_DISTRICTS } from "../lib/constants";
import { useAuthStore } from "../store/authStore";
import OtpModal from "../components/OtpModal";

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(strongPasswordRegex, "Password must meet all strong password criteria below"),
  org: z.string().optional(),
  district: z.string().optional(),
  role: z.enum([ROLES.REPORTER, ROLES.UNIVERSITY, ROLES.INDUSTRY]),
});

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);

  const registerUser = useAuthStore((s) => s.register);
  const sendOtp = useAuthStore((s) => s.sendOtp);
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
  const email = watch("email");
  const password = watch("password") || "";

  // Dynamic Email Placeholder according to selected role
  const getEmailPlaceholder = () => {
    switch (role) {
      case ROLES.UNIVERSITY:
        return "e.g. faculty@university.edu.in";
      case ROLES.INDUSTRY:
        return "e.g. contact@company.com";
      case ROLES.REPORTER:
      default:
        return "e.g. user@gmail.com";
    }
  };

  // Password Criteria checks
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least 1 uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "At least 1 number (0-9)", met: /[0-9]/.test(password) },
    { label: "At least 1 special character (@, $, !, %, *, #, etc.)", met: /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  // Step 1: Click "Join Sahayog Network" -> Send OTP to email
  async function onSubmit(values) {
    setPendingValues(values);
    setOtpLoading(true);
    setOtpError(null);
    try {
      await sendOtp(values.email, values.name);
      setOtpModalOpen(true);
    } catch (err) {
      useAuthStore.setState({ error: err.message || "Failed to send verification code" });
    } finally {
      setOtpLoading(false);
    }
  }

  // Step 2: Verify OTP and enter the web platform
  async function handleVerifyOtp(otpCode) {
    if (!pendingValues) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const user = await registerUser({
        ...pendingValues,
        otp: otpCode,
      });
      setOtpModalOpen(false);

      if (user.status === "pending") {
        navigate("/signup/pending");
      } else {
        navigate(homeForRole(user));
      }
    } catch (err) {
      setOtpError(err.message || "Incorrect verification code");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!pendingValues?.email) return;
    try {
      const res = await sendOtp(pendingValues.email, pendingValues.name);
      return res;
    } catch (err) {
      setOtpError(err.message || "Failed to resend code");
      throw err;
    }
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
        {/* Full Name */}
        <label className="block text-sm font-medium text-slate-700">
          Full Name
          <input
            {...register("name")}
            placeholder="e.g. Ramesh Kumar / Asha Menon"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          />
          {formState.errors.name && <p className="text-xs text-rose-600 mt-1">{formState.errors.name.message}</p>}
        </label>

        {/* Role Type */}
        <label className="block text-sm font-medium text-slate-700">
          Role Type
          <select
            {...register("role")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10 bg-white"
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
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10 bg-white"
          >
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        {/* Dynamic Email address */}
        <label className="block text-sm font-medium text-slate-700">
          Email address
          <input
            {...register("email")}
            placeholder={getEmailPlaceholder()}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
          />
          {formState.errors.email && <p className="text-xs text-rose-600 mt-1">{formState.errors.email.message}</p>}
        </label>

        {/* Strong Password */}
        <label className="block text-sm font-medium text-slate-700">
          Password
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter a strong password"
              className="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formState.errors.password && <p className="text-xs text-rose-600 mt-1">{formState.errors.password.message}</p>}
        </label>

        {/* Strong Password Criteria Guide */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3 text-xs">
          <p className="font-semibold text-slate-700 mb-1.5">Password Criteria:</p>
          <div className="space-y-1">
            {criteria.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {item.met ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <X className="h-3.5 w-3.5 text-slate-300 stroke-[2]" />
                )}
                <span className={item.met ? "text-emerald-700 font-medium" : "text-slate-500"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-600">{error}</p>}

        <button
          disabled={loading || otpLoading}
          className="w-full rounded-xl bg-[#0E4B4C] py-3 text-sm font-semibold text-white shadow-md shadow-[#0E4B4C]/20 transition hover:bg-[#0b3b3c] disabled:opacity-60 cursor-pointer"
        >
          {loading || otpLoading ? "Sending Verification Code..." : "Join Sahayog Network"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-[#0E4B4C] hover:underline">
          Log in
        </Link>
      </p>

      {/* OTP Verification Popup */}
      <OtpModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        email={pendingValues?.email || email}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        loading={otpLoading}
        error={otpError}
      />
    </AuthLayout>
  );
}
