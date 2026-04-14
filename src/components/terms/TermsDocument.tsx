import type { ReactNode } from "react";

export const TERMS_VERSION = "1.0";

export function TermsDocument() {
  return (
    <div className="space-y-8 text-neutral-800 leading-relaxed">
      <p className="text-sm text-neutral-500">
        Version {TERMS_VERSION} · Last updated when you read this. Plain
        language first, legal scaffolding second. Your child's safety comes
        before everything we build.
      </p>

      <Section n={1} title="What ZOE is">
        <p>
          ZOE is a behavioral documentation and pattern observation tool built
          for families and care teams of nonverbal and minimally verbal
          autistic children. ZOE helps you record short video moments, tag
          them, and see patterns over time.
        </p>
        <p>
          <strong>ZOE is not a medical device.</strong> ZOE is not a diagnostic
          tool. ZOE is not a substitute for professional therapy, clinical
          judgment, or medical care. ZOE is not FDA-cleared or equivalent in
          any jurisdiction. Nothing ZOE shows you is a clinical finding.
        </p>
      </Section>

      <Section n={2} title="AI and automated analysis">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Tag suggestions (Gemini AI).</strong> When you upload a
            clip, ZOE may send the video to Google's Gemini model to suggest
            behavior tags. You review and control every tag — AI only
            pre-selects. You can remove anything.
          </li>
          <li>
            <strong>Audio analysis runs in your browser.</strong> Pitch,
            rhythm, and vocalization duration are computed locally using the
            Web Audio API. <em>Audio never leaves your device.</em>
          </li>
          <li>
            <strong>Movement detection runs in your browser.</strong> Pose
            estimation uses MediaPipe loaded as WebAssembly.{" "}
            <em>Video frames never leave your device</em> during pose analysis.
          </li>
          <li>
            All AI observations are clearly labeled as "ZOE observed" and are
            not clinical findings. Parents and therapists remain the
            decision-makers.
          </li>
        </ul>
      </Section>

      <Section n={3} title="Data we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>Videos you upload</li>
          <li>Behavior tags, antecedents, consequences, and context you add</li>
          <li>Audio-feature summaries (numbers, not audio clips)</li>
          <li>Movement-feature summaries (numbers, not frames)</li>
          <li>Parent reflections you choose to write</li>
          <li>Child profile fields you enter</li>
          <li>Therapist annotations (when a therapist is on your care team)</li>
        </ul>
      </Section>

      <Section n={4} title="How we store your data">
        <ul className="list-disc space-y-1 pl-5">
          <li>Encrypted at rest on Supabase infrastructure</li>
          <li>Private storage buckets — not publicly readable</li>
          <li>
            Videos are served only via signed URLs with short expirations
          </li>
          <li>
            Row-level security policies enforce that you can only read your own
            family's data
          </li>
        </ul>
      </Section>

      <Section n={5} title="How we use your data">
        <p className="font-medium">
          ZOE uses your data to provide the service, and — only with your
          consent — to improve pattern detection and research insight quality.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>We never sell your data.</li>
          <li>We never share with advertisers.</li>
          <li>We never share with insurance companies or employers.</li>
          <li>We never make your data public.</li>
        </ul>
      </Section>

      <Section n={6} title="De-identified data for improvement">
        <p>
          "De-identified" means we strip every personal identifier — your name,
          your child's name, email, IDs, file names, timestamps at fine
          granularity — and retain only statistical patterns (e.g. "tag X
          followed tag Y 68% of the time across many families").
        </p>
        <p>
          You can opt out in Profile &rsaquo; Preferences at any time, without
          losing any features. Opting out only affects whether your aggregated
          patterns contribute to improving ZOE for everyone.
        </p>
      </Section>

      <Section n={7} title="Care team data sharing">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            You invite care team members by email. Therapists can view clips
            and add annotations. Family members can view clips only.
          </li>
          <li>
            You control access. You can remove anyone anytime, and they lose
            access immediately.
          </li>
          <li>
            Private therapist annotations are visible only to the care team,
            not to parents — a common clinical convention for candid notes.
          </li>
        </ul>
      </Section>

      <Section n={8} title="Children's privacy">
        <p>
          ZOE does not collect data from children directly. The parent or legal
          guardian is the account holder and controls every action. All data
          entry is performed by the adult. Our handling aligns with COPPA
          principles for parental consent and control.
        </p>
      </Section>

      <Section n={9} title="Research insights">
        <ul className="list-disc space-y-1 pl-5">
          <li>Research insights are informational only — not clinical recommendations.</li>
          <li>
            Insights are drawn from peer-reviewed papers uploaded by our team
            and reviewed before activation.
          </li>
          <li>Citations (title, authors, year) are always shown.</li>
          <li>
            You can thumbs-down any insight — we use that feedback to tune
            quality and remove misleading sources.
          </li>
        </ul>
      </Section>

      <Section n={10} title="Your data rights">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Export all your data anytime as JSON (Profile &rsaquo; Your data).
          </li>
          <li>
            Delete your account and all your data permanently, anytime. This is
            irreversible.
          </li>
          <li>
            After deletion, no personal data is retained. Pre-existing
            aggregated de-identified patterns that do not identify you may
            remain, as they contain no individual data.
          </li>
        </ul>
      </Section>

      <Section n={11} title="Limitation of liability">
        <p>
          ZOE is provided as-is, without warranty of any kind, express or
          implied. We make no claims about AI accuracy. We are not liable for
          decisions made based on ZOE's output. For medical, therapeutic, or
          educational decisions about your child, consult qualified
          professionals — ZOE is documentation support, not a decision-maker.
        </p>
      </Section>

      <Section n={12} title="Changes to these terms">
        <p>
          We may update these terms. When we do, you'll be notified on your
          next sign-in and asked to review the changes. Continued use after
          updates constitutes acceptance of the new version.
        </p>
      </Section>
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-primary-500">
        <span className="font-mono text-primary-500/80">§{n}</span>{" "}
        <span className="text-neutral-900">{title}</span>
      </h2>
      <div className="mt-3 space-y-3 text-base">{children}</div>
    </section>
  );
}
