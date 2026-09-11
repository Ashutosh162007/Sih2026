import { useState, useEffect, useRef } from "react";
import { Mail, ArrowRight, RefreshCw, X, AlertCircle, ShieldCheck } from "lucide-react";
import { useLanguageStore } from "../store/languageStore";

export default function OtpModal({
  isOpen,
  onClose,
  email,
  onVerify,
  onResend,
  loading = false,
  error = null,
}) {
  const { t } = useLanguageStore();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setCooldown(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (value.length > 1) {
      const pasteData = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...digits];
      pasteData.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(pasteData.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (pasteData.length === 6) {
        onVerify(newDigits.join(""));
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);

    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === 6 && !newDigits.includes("")) {
      onVerify(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      setCooldown(60);
    } finally {
      setResending(false);
    }
  };

  const isComplete = digits.every((d) => d.length === 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0E4B4C]/10 text-[#0E4B4C]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-slate-900">{t("verifyEmailTitle")}</h3>
          <p className="mt-1 text-xs text-slate-500">{t("otpSentNotice")}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Mail className="h-3.5 w-3.5 text-[#0E4B4C]" />
            <span>{email}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <div className="mt-6 flex justify-center gap-2 sm:gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`h-12 w-11 sm:h-14 sm:w-13 rounded-xl border text-center font-mono text-xl sm:text-2xl font-bold transition outline-none shadow-sm ${
                digit
                  ? "border-[#0E4B4C] bg-teal-50/40 text-[#0E4B4C] ring-2 ring-[#0E4B4C]/20"
                  : "border-slate-300 bg-white text-slate-900 focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/20"
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!isComplete || loading}
            onClick={() => onVerify(digits.join(""))}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B4C] py-3 text-sm font-bold text-white shadow-md shadow-[#0E4B4C]/20 transition hover:bg-[#0b3b3c] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t("verifyingCode")}</span>
              </>
            ) : (
              <>
                <span>{t("verifyOtpBtn")}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Resend Timer */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {t("didntReceiveOtp")}{" "}
          {cooldown > 0 ? (
            <span className="font-semibold text-slate-600">
              {t("resendIn")} <span className="font-mono text-[#0E4B4C]">{cooldown}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-[#0E4B4C] hover:underline disabled:opacity-50 cursor-pointer"
            >
              {resending ? "Sending..." : t("resendOtp")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
