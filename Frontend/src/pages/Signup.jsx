import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw, KeyRound } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { ROLES, ROLE_LABELS, JHARKHAND_DISTRICTS } from "../lib/constants";
import { useAuthStore } from "../store/authStore";

const DISPOSABLE_EMAIL_DOMAINS = [
  "fake.com",
  "test.com",
  "example.com",
  "tempmail.com",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com",
  "trashmail.com",
  "yopmail.com",
  "sharklasers.com",
  "dispostable.com",
  "getairmail.com",
  "throwawaymail.com",
  "fakeinbox.com",
];

const FAKE_NAMES = ["test", "tester", "fake", "fakeuser", "dummy", "dummyuser", "unknown", "anonymous", "asdf", "qwerty", "admin", "sample"];

const schema = z.object({
  name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(60, "Name cannot exceed 60 characters")
    .regex(/^[a-zA-Z\u00C0-\u024F\s.'-]+$/, "Please enter a valid real name (letters, spaces, and standard titles only)")
    .refine((val) => !/[-']{2,}/.test(val) && !/^\s*[-']|[-']\s*$/.test(val), {
      message: "Please enter a valid real name formatting",
    })
    .refine((val) => {
      const letters = val.replace(/[^a-zA-Z]/g, "");
      return letters.length >= 3;
    }, { message: "Name must contain at least 3 letters" })
    .refine((val) => !FAKE_NAMES.includes(val.toLowerCase().replace(/[^a-z]/g, "")), {
      message: "Please enter a genuine full name (no dummy/placeholder names)",
    })
    .refine((val) => !/^(.)\1{2,}$/i.test(val.replace(/[^a-z]/gi, "")), {
      message: "Name cannot be repetitive placeholder characters",
    }),
  email: z
    .string()
    .min(5, "Email address is required")
    .email("Please enter a valid email address")
    .refine(
      (val) => {
        const domain = val.split("@")[1]?.toLowerCase();
        return !DISPOSABLE_EMAIL_DOMAINS.includes(domain);
      },
      { message: "Disposable or fake email addresses are not permitted" }
    )
    .refine(
      (val) => {
        const localPart = val.split("@")[0]?.toLowerCase();
        return !["fake", "test", "dummy", "sample", "temp", "asdf", "qwerty"].includes(localPart);
      },
      { message: "Please use a genuine email address" }
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password cannot exceed 64 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
    .regex(/[0-9]/, "Password must contain at least one numeric digit (0-9)")
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/, "Password must contain at least one special character (!@#$%...)"),
  role: z.enum([ROLES.REPORTER, ROLES.UNIVERSITY, ROLES.INDUSTRY, ROLES.ADMIN]),
  district: z.string().min(1, "District is required"),
  org: z.string().optional(),
});

export default function Signup() {
  const registerUser = useAuthStore((s) => s.register);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const homeForRole = useAuthStore((s) => s.homeForRole);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);
  const [previewOtp, setPreviewOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const otpInputsRef = useRef([]);

  const { register, handleSubmit, watch, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: ROLES.REPORTER,
      district: "Ranchi",
      org: "",
    },
  });

  const role = watch("role");
  const password = watch("password") || "";

  // Password strength meter calculation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password);

  const passedChecks = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthScore = password.length === 0 ? 0 : passedChecks;

  const strengthLabels = ["Too Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-teal-500",
    "bg-emerald-600",
  ];

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
      const response = await registerUser(values);
      if (response && response.requireOtp) {
        setPendingEmail(response.email || values.email);
        setPreviewOtp(response.previewOtp || "");
        setShowOtpModal(true);
        setOtpError("");
        setOtpSuccess(response.message || "A 6-digit verification code has been sent to your email.");
        setResendCountdown(60);
        setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
        return;
      }

      if (response && response.status === "pending") {
        navigate("/signup/pending");
      } else {
        navigate(homeForRole(response));
      }
    } catch (err) {
      // Handled in authStore
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

  return (
    <AuthLayout headline="Join the Sahayog Innovation Network">
      <h2 className="font-display text-3xl font-bold text-slate-900">Create account</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter your verified credentials to create a secure account.
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
        <span className="h-px flex-1 bg-slate-200" /> or register with email & OTP verification <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Full Name (First & Last)
            <input
              {...register("name")}
              placeholder="e.g. Dr. Ramesh Sharma / Priya Verma"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
            />
          </label>
          {formState.errors.name && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Role Type */}
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

        {/* District */}
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

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email Address (Verification OTP will be sent)
            <input
              {...register("email")}
              type="email"
              placeholder={
                role === ROLES.UNIVERSITY
                  ? "e.g. faculty@bitmesra.ac.in / yourname@gmail.com"
                  : role === ROLES.INDUSTRY
                  ? "e.g. csr@tatasteel.com / yourname@gmail.com"
                  : "e.g. citizen@gmail.com"
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
            />
          </label>
          <p className="mt-1 text-[11px] text-slate-400">
            {role === ROLES.REPORTER
              ? "You can use your personal @gmail.com, Yahoo, Outlook, or any standard email."
              : "Institutional or personal email addresses are accepted."}
          </p>
          {formState.errors.email && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password & Live Strength Meter */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Strong Password
            <input
              type="password"
              {...register("password")}
              placeholder="Min. 8 chars with uppercase, number & symbol"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
            />
          </label>
          {formState.errors.password && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {formState.errors.password.message}
            </p>
          )}

          {/* Real-time Password Strength Visualizer */}
          {password.length > 0 && (
            <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Password Strength:</span>
                <span className={`font-semibold ${strengthScore >= 4 ? "text-emerald-700" : strengthScore >= 3 ? "text-teal-700" : "text-rose-600"}`}>
                  {strengthLabels[strengthScore - 1] || "Too Weak"}
                </span>
              </div>
              <div className="flex gap-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 transition-all duration-300 ${
                      level <= strengthScore ? strengthColors[strengthScore - 1] : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                <div className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                  {hasMinLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} 8+ Characters
                </div>
                <div className={`flex items-center gap-1 ${hasUpper && hasLower ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                  {hasUpper && hasLower ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Upper & Lowercase
                </div>
                <div className={`flex items-center gap-1 ${hasNumber ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                  {hasNumber ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} At least 1 Number
                </div>
                <div className={`flex items-center gap-1 ${hasSpecial ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                  {hasSpecial ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Special Symbol (!@#$)
                </div>
              </div>
            </div>
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
          {loading ? "Securing & Registering..." : "Verify & Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-[#0E4B4C] hover:underline cursor-pointer">
          Log in
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
                <p className="text-xs text-slate-500">Enter the 6-digit security code</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              We sent a 6-digit verification code to <span className="font-semibold text-slate-900">{pendingEmail}</span>.
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
                  className="text-xs font-semibold text-[#0E4B4C] underline hover:text-[#0b3b3c] cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* 6 OTP Input Boxes */}
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
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="hover:text-slate-800 underline cursor-pointer"
                >
                  Change details
                </button>
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
                {isVerifying ? "Verifying..." : "Complete Verification"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

