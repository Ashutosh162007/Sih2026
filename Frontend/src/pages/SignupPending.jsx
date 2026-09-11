import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { useLanguageStore } from "../store/languageStore";

export default function SignupPending() {
  const { t } = useLanguageStore();

  return (
    <AuthLayout headline={t("verificationInProgress")}>
      <h2 className="font-display text-3xl text-slate-900">{t("accountUnderReviewTitle")}</h2>
      <p className="mt-3 text-slate-600">
        {t("accountUnderReviewDesc")}
      </p>
      <Link to="/login" className="mt-8 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
        {t("returnToLogin")}
      </Link>
    </AuthLayout>
  );
}
