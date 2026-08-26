import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function SignupPending() {
  return (
    <AuthLayout headline="Verification in progress">
      <h2 className="font-display text-3xl text-slate-900">Account under review</h2>
      <p className="mt-3 text-slate-600">
        University and industry accounts need Admin approval before accessing queues and funding tools. You will be
        notified once verification is complete.
      </p>
      <Link to="/login" className="mt-8 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
        Return to login
      </Link>
    </AuthLayout>
  );
}
