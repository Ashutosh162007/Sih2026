import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Globe, AlertCircle } from "lucide-react";
import { useLanguageStore } from "../store/languageStore";

export default function VoiceInputButton({
  onTranscript,
  currentValue = "",
  compact = false,
  className = "",
}) {
  const { language, t } = useLanguageStore();
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState(language === "hi" ? "hi-IN" : "en-IN");
  const [supported, setSupported] = useState(true);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef(null);

  // Sync voiceLang if UI language changes
  useEffect(() => {
    setVoiceLang(language === "hi" ? "hi-IN" : "en-IN");
  }, [language]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText("");
      };

      recognition.onresult = (event) => {
        let finalChunk = "";
        let interimChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + " ";
          } else {
            interimChunk += transcript;
          }
        }

        if (finalChunk) {
          const updatedValue = currentValue
            ? `${currentValue.trim()} ${finalChunk.trim()}`
            : finalChunk.trim();
          onTranscript(updatedValue);
        }

        setInterimText(interimChunk);
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition notice:", err.error);
        if (err.error === "not-allowed" || err.error === "service-not-allowed") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error("SpeechRecognition init error:", e);
      setSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [voiceLang, currentValue, onTranscript]);

  const toggleListening = () => {
    if (!supported) {
      alert(t("voiceNotSupported"));
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = voiceLang;
        try {
          recognitionRef.current.start();
        } catch (e) {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        }
      }
    }
  };

  const toggleVoiceLang = (e) => {
    e.stopPropagation();
    const nextLang = voiceLang === "hi-IN" ? "en-IN" : "hi-IN";
    setVoiceLang(nextLang);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.lang = nextLang;
          recognitionRef.current.start();
        }
      }, 300);
    }
  };

  if (!supported) {
    return null;
  }

  // Compact inline mic button (e.g. for single-line inputs)
  if (compact) {
    return (
      <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={toggleListening}
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition cursor-pointer ${
            isListening
              ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
              : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-[#0E4B4C] hover:bg-white hover:text-[#0E4B4C]"
          }`}
          title={isListening ? t("stopListening") : t("speakNow")}
        >
          {isListening ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Mic size={14} className="animate-bounce" />
              <span>{t("stopListening")}</span>
            </>
          ) : (
            <>
              <Mic size={14} className="text-[#0E4B4C]" />
              <span>{voiceLang === "hi-IN" ? "बोलें" : "Speak"}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={toggleVoiceLang}
          className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          title="Switch Voice Recognition Language"
        >
          {voiceLang === "hi-IN" ? "हिंदी" : "EN"}
        </button>
      </div>
    );
  }

  // Full dictation card / banner (e.g. for Description step)
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      isListening
        ? "border-rose-300 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/40 p-4 shadow-sm"
        : "border-teal-200 bg-gradient-to-r from-[#D7F5DE]/30 via-white to-teal-50/20 p-4 shadow-xs"
    } ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition shadow-md cursor-pointer ${
              isListening
                ? "bg-rose-600 text-white animate-pulse shadow-rose-600/30 scale-105"
                : "bg-[#0E4B4C] text-white hover:bg-[#0b3b3c] shadow-[#0E4B4C]/25"
            }`}
            title={isListening ? t("stopListening") : t("speakNow")}
          >
            {isListening ? <MicOff size={20} className="animate-spin" /> : <Mic size={20} />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900">
                {isListening ? (
                  <span className="text-rose-600 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                    </span>
                    {t("listening")}
                  </span>
                ) : (
                  t("voiceInput")
                )}
              </h4>
              <span className="rounded bg-teal-100/80 px-2 py-0.5 text-[10px] font-bold text-teal-900 border border-teal-200">
                {voiceLang === "hi-IN" ? "हिंदी (Hindi Mic)" : "English Mic"}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              {isListening
                ? (interimText ? `"${interimText}..."` : "Speak clearly into your microphone in Hindi or English...")
                : t("voiceHelper")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Language Toggle */}
          <button
            type="button"
            onClick={toggleVoiceLang}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-[#0E4B4C] hover:text-[#0E4B4C] transition cursor-pointer"
          >
            <Globe size={13} className="text-[#0E4B4C]" />
            <span>{voiceLang === "hi-IN" ? "हिंदी ⇄ English" : "English ⇄ हिंदी"}</span>
          </button>

          <button
            type="button"
            onClick={toggleListening}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
              isListening
                ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/25"
                : "bg-[#0E4B4C] text-white hover:bg-[#0b3b3c] shadow-[#0E4B4C]/25"
            }`}
          >
            {isListening ? t("stopListening") : t("speakNow")}
          </button>
        </div>
      </div>

      {isListening && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-rose-100 pt-2.5">
          <div className="flex gap-1 items-end h-4">
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_1s_infinite_100ms] h-2"></span>
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_1s_infinite_200ms] h-4"></span>
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_1s_infinite_300ms] h-3"></span>
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_1s_infinite_400ms] h-5"></span>
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_1s_infinite_250ms] h-2.5"></span>
          </div>
          <span className="text-[11px] font-medium text-rose-700 italic">
            {interimText ? `Recognizing: "${interimText}"` : "Transcribing your speech in real time..."}
          </span>
        </div>
      )}
    </div>
  );
}
