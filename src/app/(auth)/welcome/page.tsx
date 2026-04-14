import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["italic", "normal"],
});

export default function WelcomePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#0f2035" }}
    >
      <div className="animate-zoe-fade-in flex flex-col items-center">
        <h1
          className={`${displayFont.className} italic`}
          style={{
            color: "#c9a84c",
            fontSize: "clamp(84px, 18vw, 160px)",
            lineHeight: 1,
            letterSpacing: "0.04em",
            textShadow: "0 2px 30px rgba(201, 168, 76, 0.25)",
          }}
        >
          ZOE
        </h1>

        <p
          className={`${displayFont.className} mt-6 italic`}
          style={{
            color: "#f5f0e0",
            fontSize: "clamp(18px, 3.2vw, 24px)",
            letterSpacing: "0.02em",
            opacity: 0.92,
          }}
        >
          See what your child is telling you
        </p>

        <Link
          href="/login"
          className="mt-14 inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-medium tracking-wide transition hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(201,168,76,0.35)]"
          style={{
            backgroundColor: "#c9a84c",
            color: "#0f2035",
          }}
        >
          Get Started
        </Link>

        <p
          className="mt-6 text-xs"
          style={{ color: "#f5f0e0", opacity: 0.55 }}
        >
          Already have an account?{" "}
          <Link href="/login" className="underline hover:opacity-80">
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes zoe-fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-zoe-fade-in {
          animation: zoe-fade-in 900ms ease-out both;
        }
      `}</style>
    </main>
  );
}
