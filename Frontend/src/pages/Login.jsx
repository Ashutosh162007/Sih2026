import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { KeyRound, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const homeForRole = useAuthStore((s) => s.homeForRole);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  // OTP Verification Modal for unverified logins
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);
  const [previewOtp, setPreviewOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const otpInputsRef = useRef([]);

  const { register, handleSubmit, setValue, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "citizen@sahayog.in", password: "password" },
  });

  useEffect(() => {
    let timer;
    if (showOtpModal && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, resendCountdown]);

  async function onSubmit(values) {
    try {
      const response = await login(values.email, values.password);
      if (response && response.requireOtp) {
        setPendingEmail(response.email || values.email);
        setPreviewOtp(response.previewOtp || "");
        setShowOtpModal(true);
        setOtpError("");
        setOtpSuccess(response.message || "Please enter the 6-digit verification code sent to your email.");
        setResendCountdown(60);
        setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
        return;
      }
      navigate(homeForRole(response));
    } catch (err) {
      // Handled in store
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
    }
  };

  async function handleVerifyOtpSubmit(e) {
    e?.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsVerifying(true);
    setOtpError("");
    try {
      const result = await verifyOtp(pendingEmail, fullOtp);
      setShowOtpModal(false);
      if (result.user?.status === "pending") {
        navigate("/signup/pending");
      } else {
        navigate(homeForRole(result.user));
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendOtp() {
    if (resendCountdown > 0) return;
    setOtpError("");
    setOtpSuccess("");
    try {
      const result = await resendOtp(pendingEmail);
      setPreviewOtp(result.previewOtp || "");
      setOtpSuccess(result.message || "A new 6-digit verification code has been sent.");
      setResendCountdown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to resend verification code.");
    }
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
      <h2 className="font-display text-3xl font-bold text-slate-900">Welcome to Sahayog</h2>
      <p className="mt-1.5 text-sm text-slate-500">Sign in to your collaboration workspace.</p>

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
        <span className="h-px flex-1 bg-slate-200" /> or continue with credentials <span className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Quick Demo Selector */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-600 mb-2">Quick Demo Account Switcher:</p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => quickLogin("citizen@sahayog.in")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 cursor-pointer"
          >
            👤 Citizen
          </button>
          <button
            type="button"
            onClick={() => quickLogin("university@sahayog.in")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 cursor-pointer"
          >
            🎓 University / HEI
          </button>
          <button
            type="button"
            onClick={() => quickLogin("industry@sahayog.in")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 cursor-pointer"
          >
            🏢 Industry / CSR
          </button>
          <button
            type="button"
            onClick={() => quickLogin("admin@sahayog.in")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 cursor-pointer"
          >
            🛡️ Admin / Govt
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              {...register("email")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
            />
          </label>
          {formState.errors.email && (
            <span className="text-xs text-rose-600 mt-1 block">{formState.errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
            />
          </label>
          {formState.errors.password && (
            <span className="text-xs text-rose-600 mt-1 block">{formState.errors.password.message}</span>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0E4B4C] py-3 text-sm font-semibold text-white shadow-md shadow-[#0E4B4C]/20 transition hover:bg-[#0b3b3c] disabled:opacity-60 cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4" />
          {loading ? "Signing in..." : "Sign in to Dashboard"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        New to Sahayog?{" "}
        <Link to="/signup" className="font-semibold text-[#0E4B4C] hover:underline cursor-pointer">
          Create an account
        </Link>
      </p>

      {/* ========================================================================= */}
      {/* 6-DIGIT EMAIL OTP VERIFICATION MODAL OVERLAY */}
      {/* ========================================================================= */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#0E4B4C] border border-teal-100">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Email Verification</h3>
                <p className="text-xs text-slate-500">Activate your unverified account</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Please enter the 6-digit verification code sent to <span className="font-semibold text-slate-900">{pendingEmail}</span>.
            </p>

            {/* Dev Helper Banner */}
            {previewOtp && (
              <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50/80 p-2.5 text-xs text-teal-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold">Demo OTP Code: </span>
                  <span className="font-mono text-sm tracking-wider font-bold bg-white px-2 py-0.5 rounded border border-teal-300">
                    {previewOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = previewOtp.split("").slice(0, 6);
                    setOtpDigits(digits);
                    otpInputsRef.current[5]?.focus();
                  }}
                  className="text-[11px] font-semibold text-teal-700 underline hover:text-teal-900 ml-2 cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <form onSubmit={handleVerifyOtpSubmit} className="mt-5 space-y-4">
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="h-12 w-12 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-[#0E4B4C] focus:bg-white focus:ring-2 focus:ring-[#0E4B4C]/20 outline-none transition"
                  />
                ))}
              </div>

              {otpError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && !otpError && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  {resendCountdown > 0 ? (
                    `Resend in ${resendCountdown}s`
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-semibold text-[#0E4B4C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" /> Resend Code
                    </button>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying || otpDigits.join("").length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0E4B4C] py-3 text-sm font-semibold text-white shadow-md shadow-[#0E4B4C]/20 transition hover:bg-[#0b3b3c] disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isVerifying ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

