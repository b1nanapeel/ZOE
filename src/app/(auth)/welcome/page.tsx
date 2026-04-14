import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import {
  Camera,
  Tag,
  TrendingUp,
  Users,
  ClipboardList,
  Target,
  Lock,
  Cpu,
  ShieldCheck,
  Download,
  Heart,
} from "lucide-react";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["italic", "normal"],
});

const COLORS = {
  bg: "#0f2035",
  card: "#1a3352",
  gold: "#c9a84c",
  cream: "#f5f0e0",
};

export default function WelcomePage() {
  return (
    <main
      className="min-h-screen scroll-smooth"
      style={{ backgroundColor: COLORS.bg, color: COLORS.cream }}
    >
      {/* ============ HERO ============ */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="animate-zoe-fade-in flex flex-col items-center">
          <h1
            className={`${displayFont.className} italic`}
            style={{
              color: COLORS.gold,
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
              color: COLORS.cream,
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
            style={{ backgroundColor: COLORS.gold, color: COLORS.bg }}
          >
            Get Started
          </Link>

          <p
            className="mt-6 text-xs"
            style={{ color: COLORS.cream, opacity: 0.55 }}
          >
            Already have an account?{" "}
            <Link href="/login" className="underline hover:opacity-80">
              Sign in
            </Link>
          </p>
        </div>

        <a
          href="#problem"
          className="absolute bottom-10 text-xs tracking-widest opacity-50 hover:opacity-90"
          style={{ color: COLORS.cream }}
        >
          SCROLL ↓
        </a>
      </section>

      {/* ============ 1. THE 165-HOUR GAP ============ */}
      <section
        id="problem"
        className="px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-xs tracking-[0.3em]"
            style={{ color: COLORS.gold, opacity: 0.85 }}
          >
            THE 165-HOUR GAP
          </p>
          <h2
            className={`${displayFont.className} mt-6 italic`}
            style={{
              color: COLORS.gold,
              fontSize: "clamp(34px, 6vw, 56px)",
              lineHeight: 1.1,
            }}
          >
            Your child receives therapy
            <br />1–3 hours per week.
          </h2>
          <p
            className={`${displayFont.className} mt-8 italic`}
            style={{
              color: COLORS.cream,
              fontSize: "clamp(20px, 3.5vw, 28px)",
              lineHeight: 1.4,
              opacity: 0.9,
            }}
          >
            What about the other 165 hours?
          </p>
          <p
            className="mx-auto mt-8 max-w-xl text-base leading-relaxed"
            style={{ color: COLORS.cream, opacity: 0.75 }}
          >
            The breakthroughs, the meltdowns, the tiny wins — they happen at
            home, in the car, at the grocery store. ZOE helps you capture those
            moments so your therapist sees the full picture.
          </p>
        </div>
      </section>

      {/* ============ 2. HOW ZOE WORKS ============ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p
              className="text-xs tracking-[0.3em]"
              style={{ color: COLORS.gold, opacity: 0.85 }}
            >
              HOW IT WORKS
            </p>
            <h2
              className={`${displayFont.className} mt-6 italic`}
              style={{
                color: COLORS.gold,
                fontSize: "clamp(34px, 6vw, 56px)",
                lineHeight: 1.1,
              }}
            >
              Three simple steps
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Camera,
                title: "Record a moment",
                body: "Upload a short video clip when you notice something.",
              },
              {
                icon: Tag,
                title: "Tag what happened",
                body: "ZOE's AI suggests what it sees. You review, adjust, and add context.",
              },
              {
                icon: TrendingUp,
                title: "See patterns emerge",
                body: "Over time, ZOE reveals patterns your therapist needs to see.",
              },
            ].map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className="rounded-2xl p-8 transition hover:-translate-y-1"
                style={{
                  backgroundColor: COLORS.card,
                  boxShadow: "0 4px 40px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "rgba(201,168,76,0.12)",
                    color: COLORS.gold,
                  }}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <p
                  className="mt-6 text-xs tracking-widest"
                  style={{ color: COLORS.gold, opacity: 0.8 }}
                >
                  STEP {i + 1}
                </p>
                <h3
                  className={`${displayFont.className} mt-2 text-2xl`}
                  style={{ color: COLORS.cream }}
                >
                  {title}
                </h3>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: COLORS.cream, opacity: 0.72 }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3. CARE TEAM ============ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p
              className="text-xs tracking-[0.3em]"
              style={{ color: COLORS.gold, opacity: 0.85 }}
            >
              TOGETHER
            </p>
            <h2
              className={`${displayFont.className} mt-6 italic`}
              style={{
                color: COLORS.gold,
                fontSize: "clamp(34px, 6vw, 56px)",
                lineHeight: 1.1,
              }}
            >
              Built for your child's care team
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Invite your therapists",
                body: "Parents bring their speech, OT, or ABA team into one shared view.",
              },
              {
                icon: ClipboardList,
                title: "Session prep summaries",
                body: "Therapists walk into every session already knowing the week.",
              },
              {
                icon: Target,
                title: "Observation missions",
                body: "Therapists send gentle prompts for what to watch for at home.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl p-6"
                style={{ backgroundColor: COLORS.card }}
              >
                <Icon
                  className="h-6 w-6"
                  style={{ color: COLORS.gold }}
                  strokeWidth={1.75}
                />
                <h3
                  className={`${displayFont.className} mt-4 text-xl`}
                  style={{ color: COLORS.cream }}
                >
                  {title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: COLORS.cream, opacity: 0.72 }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4. PRIVACY ============ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p
              className="text-xs tracking-[0.3em]"
              style={{ color: COLORS.gold, opacity: 0.85 }}
            >
              PRIVACY
            </p>
            <h2
              className={`${displayFont.className} mt-6 italic`}
              style={{
                color: COLORS.gold,
                fontSize: "clamp(34px, 6vw, 56px)",
                lineHeight: 1.1,
              }}
            >
              Your child's privacy comes first
            </h2>
          </div>

          <ul className="mt-14 space-y-5">
            {[
              {
                icon: Lock,
                text: "Videos are encrypted and only you control access.",
              },
              {
                icon: Cpu,
                text: "Audio and movement analysis happen on your device — nothing leaves your phone.",
              },
              {
                icon: ShieldCheck,
                text: "We never sell your data. Ever.",
              },
              {
                icon: Download,
                text: "You can export or delete everything at any time.",
              },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-4 rounded-xl p-5"
                style={{ backgroundColor: COLORS.card }}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "rgba(201,168,76,0.12)",
                    color: COLORS.gold,
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: COLORS.cream, opacity: 0.88 }}
                >
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 5. FOOTER / CTA ============ */}
      <footer
        className="px-6 py-24 text-center"
        style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}
      >
        <h2
          className={`${displayFont.className} italic`}
          style={{
            color: COLORS.gold,
            fontSize: "clamp(32px, 6vw, 52px)",
            lineHeight: 1.1,
          }}
        >
          Start seeing the patterns
        </h2>
        <Link
          href="/signup"
          className="mt-10 inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-medium tracking-wide transition hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(201,168,76,0.35)]"
          style={{ backgroundColor: COLORS.gold, color: COLORS.bg }}
        >
          Get Started Free
        </Link>

        <div
          className="mt-14 flex flex-col items-center gap-3 text-xs"
          style={{ color: COLORS.cream, opacity: 0.6 }}
        >
          <p className="inline-flex items-center gap-1.5">
            Built with{" "}
            <Heart
              className="h-3 w-3"
              style={{ color: COLORS.gold }}
              fill="currentColor"
            />{" "}
            for the autism community
          </p>
          <div className="flex gap-5">
            <Link href="/terms" className="underline hover:opacity-80">
              Terms &amp; Privacy
            </Link>
            <Link href="/login" className="underline hover:opacity-80">
              Sign in
            </Link>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes zoe-fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-zoe-fade-in {
          animation: zoe-fade-in 900ms ease-out both;
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}
