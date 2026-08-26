import { Link } from "react-router-dom";

export default function AuthLayout({ children, headline = "Empowering Societal Innovation" }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden overflow-hidden bg-primary lg:block"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(14,75,76,0.85), rgba(14,75,76,0.55)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <Link to="/" className="font-display text-3xl">
            CivicPulse
          </Link>
          <h1 className="font-display mt-6 max-w-md text-4xl leading-tight">{headline}</h1>
          <p className="mt-4 max-w-md text-white/80">
            Connecting Community Reporters, universities, and industry to close civic issues with evidence and
            accountability.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
