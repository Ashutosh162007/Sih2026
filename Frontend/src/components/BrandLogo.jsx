import logo from "../assets/sahayog-logo.png";

export default function BrandLogo({ className = "h-10 w-10", inverted = false }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ${className}`}
      style={{ backgroundColor: "#ffffff" }}
    >
      <img src={logo} alt="Sahayog" className="h-full w-full object-contain p-0.5" />
    </span>
  );
}
