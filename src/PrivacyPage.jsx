import { useState, useEffect, useRef } from "react";

// ─── TOC sections ─────────────────────────────────────────────────────────────
const TOC = [
  { id: "overview", num: "01", label: "Overview" },
  { id: "data", num: "02", label: "Data We Handle" },
  { id: "how", num: "03", label: "How It Works" },
  { id: "storage", num: "04", label: "No Data Storage" },
  { id: "thirdparty", num: "05", label: "Third Parties" },
  { id: "rights", num: "06", label: "Your Rights" },
  { id: "contact", num: "07", label: "Contact" },
];

const TRUST_ITEMS = [
  { icon: "🔒", label: "No Data\nCollection" },
  { icon: "🖥️", label: "100%\nClient-Side" },
  { icon: "🚫", label: "No Servers\nInvolved" },
  { icon: "📭", label: "No Email\nRequired" },
  { icon: "🍪", label: "No Tracking\nCookies" },
];

// ─── Reusable styled components ───────────────────────────────────────────────
function SectionHeader({ num, title, subtitle }) {
  return (
    <div className="flex items-start gap-5 mb-7">
      <div
        className="w-12 h-12 bg-[#FDC800] border-[3px] border-[#1C293C] flex items-center justify-center text-[22px] tracking-[1px] flex-shrink-0 mt-1"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        {num}
      </div>
      <div>
        <h2
          className="text-[36px] tracking-[2px] leading-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {title}
        </h2>
        <p
          className="text-[10px] font-bold uppercase tracking-[2px] opacity-45 mt-1"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function HighlightBox({ icon, children }) {
  return (
    <div
      className="bg-[#FDC800] border-[3px] border-[#1C293C] p-6 flex gap-4 items-start my-6"
      style={{ boxShadow: "4px 4px 0 #1C293C" }}
    >
      <span className="text-[24px] flex-shrink-0 mt-[2px]">{icon}</span>
      <p className="text-[14px] font-bold leading-[1.6] text-[#1C293C]">
        {children}
      </p>
    </div>
  );
}

function DarkBox({ title, children }) {
  return (
    <div
      className="bg-[#1C293C] border-[3px] border-[#1C293C] p-7 my-6"
      style={{ boxShadow: "6px 6px 0 #1C293C" }}
    >
      <p
        className="text-[22px] tracking-[2px] text-[#FDC800] mb-3"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        {title}
      </p>
      <p className="text-[14px] text-[#FBFBF9] opacity-70 leading-[1.7]">
        {children}
      </p>
    </div>
  );
}

function Tag({ color, children }) {
  const styles = {
    yellow: "bg-[#FDC800] border-[#1C293C] text-[#1C293C]",
    green: "bg-[#dcfce7] border-[#16A34A] text-[#16A34A]",
    red: "bg-[#fee2e2] border-[#DC2626] text-[#DC2626]",
    blue: "bg-[#ede9fe] border-[#432DD7] text-[#432DD7]",
    default: "bg-[#FBFBF9] border-[#1C293C] text-[#1C293C]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-[6px] border-2 text-[10px] font-bold uppercase tracking-[2px] ${styles[color] || styles.default}`}
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {children}
    </span>
  );
}

function CheckItem({ type, children }) {
  return (
    <li className="flex items-start gap-3 text-[14px] font-medium leading-[1.6] opacity-80">
      <div
        className={`w-[22px] h-[22px] border-2 flex items-center justify-center flex-shrink-0 mt-[1px] text-[11px] font-black
          ${type === "yes" ? "bg-[#16A34A] border-[#16A34A] text-white" : "bg-[#DC2626] border-[#DC2626] text-white"}`}
      >
        {type === "yes" ? "✓" : "✗"}
      </div>
      <span>{children}</span>
    </li>
  );
}

function PolicyBody({ children }) {
  return (
    <div className="text-[15px] leading-[1.8] text-[#1C293C] opacity-80 space-y-4">
      {children}
    </div>
  );
}

// ─── Data flow diagram ────────────────────────────────────────────────────────
function DataFlow() {
  const steps = [
    { icon: "📁", label: "Your File", blocked: false },
    { icon: "🌐", label: "Browser\nMemory", blocked: false },
    { icon: "🎨", label: "Canvas\nRender", blocked: false },
    { icon: "📦", label: "ZIP\nDownload", blocked: false },
    { icon: "🚫", label: "External\nServer", blocked: true },
  ];

  return (
    <div className="border-[3px] border-[#1C293C] p-8 my-6 flex items-center justify-center flex-wrap gap-0 bg-[#FBFBF9]">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center">
          <div className="flex flex-col items-center gap-2 px-5 py-4">
            <div
              className={`w-[52px] h-[52px] border-[3px] flex items-center justify-center text-[22px]
                ${
                  s.blocked
                    ? "bg-[#fee2e2] border-[#DC2626]"
                    : "bg-[#FDC800] border-[#1C293C]"
                }`}
            >
              {s.icon}
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-[2px] text-center leading-[1.4]"
              style={{
                fontFamily: "'Space Mono', monospace",
                whiteSpace: "pre-line",
              }}
            >
              {s.label}
            </span>
            {s.blocked && (
              <span
                className="text-[9px] font-bold uppercase tracking-[1px] text-[#DC2626]"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                BLOCKED
              </span>
            )}
          </div>
          {i < steps.length - 1 && (
            <span
              className="text-[28px] opacity-30 px-1"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                opacity: i === steps.length - 2 ? 0.15 : 0.3,
              }}
            >
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Scroll progress ──────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-16 left-0 h-[3px] bg-[#FDC800] border-r-2 border-[#1C293C] z-50 transition-[width] duration-100"
      style={{ width: `${pct}%` }}
    />
  );
}

// ─── Active TOC ───────────────────────────────────────────────────────────────
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.4 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

// ─── Main Privacy Page ────────────────────────────────────────────────────────
export default function PrivacyPage({ onBack }) {
  const activeSection = useActiveSection(TOC.map((t) => t.id));

  return (
    <div
      className="min-h-screen text-[#1C293C]"
      style={{
        backgroundColor: "#FBFBF9",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(28,41,60,0.07) 1px, transparent 0)",
        backgroundSize: "24px 24px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <ScrollProgress />

      {/* ── NAV ── */}
      <nav className="border-b-[3px] border-[#1C293C] bg-[#FBFBF9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBack?.();
            }}
            className="flex items-center gap-3 no-underline text-[#1C293C]"
          >
            <span
              className="text-[28px] tracking-[3px]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              CertGen
            </span>
          </a>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] px-5 py-[10px] border-[3px] border-[#1C293C] transition-all duration-100"
            style={{
              fontFamily: "'Space Mono', monospace",
              boxShadow: "4px 4px 0 #1C293C",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1C293C";
              e.currentTarget.style.color = "#FDC800";
              e.currentTarget.style.transform = "translate(-2px,-2px)";
              e.currentTarget.style.boxShadow = "6px 6px 0 #1C293C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "";
              e.currentTarget.style.color = "";
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "4px 4px 0 #1C293C";
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="border-b-[3px] border-[#1C293C] bg-[#1C293C]">
        <div
          className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid gap-10 relative overflow-hidden"
          style={{
            gridTemplateColumns: "1fr auto",
            alignItems: "end",
          }}
        >
          {/* BG text */}
          <span
            className="absolute text-white opacity-[0.03] tracking-[10px] pointer-events-none select-none whitespace-nowrap"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "260px",
              right: "-20px",
              bottom: "-40px",
              lineHeight: 1,
            }}
          >
            PRIVACY
          </span>

          <div>
            <div
              className="flex items-center gap-3 mb-4 text-[#FDC800] text-[11px] font-bold uppercase tracking-[4px]"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <span className="w-8 h-[3px] bg-[#FDC800] inline-block" />
              Legal Document
            </div>
            <h1
              className="leading-[0.92] tracking-[3px] text-[#FBFBF9]"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(56px, 7vw, 100px)",
              }}
            >
              PRIVACY
              <br />
              <span style={{ color: "#FDC800" }}>POLICY.</span>
            </h1>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: "Last Updated", value: "APR 2025" },
              { label: "Version", value: "1.0.0" },
            ].map((m) => (
              <div
                key={m.label}
                className={`px-6 py-5 ${m.label === "Last Updated" ? "bg-[#FDC800]" : "bg-[#FBFBF9]"} border-[3px] ${m.label === "Last Updated" ? "border-[#FDC800]" : "border-[#FBFBF9]"} text-right`}
              >
                <p
                  className="text-[9px] font-bold uppercase tracking-[3px] opacity-60 mb-1"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {m.label}
                </p>
                <p
                  className="text-[22px] tracking-[2px]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div className="border-b-[3px] border-[#1C293C] bg-[#FDC800]">
        <div className="max-w-7xl mx-auto flex flex-wrap">
          {TRUST_ITEMS.map((t, i) => (
            <div
              key={t.label}
              className={`flex items-center gap-3 px-7 py-5 flex-1 cursor-default transition-colors hover:bg-[#1C293C] hover:text-white group
                ${i < TRUST_ITEMS.length - 1 ? "border-r-[3px] border-[#1C293C]" : ""}`}
            >
              <span className="text-[22px]">{t.icon}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-[2px] leading-[1.5] whitespace-pre-line"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="border-b-[3px] border-[#1C293C]">
        <div className="max-w-7xl mx-auto px-6 flex">
          {/* Sidebar */}
          <aside
            className="hidden lg:block border-r-[3px] border-[#1C293C] py-12 flex-shrink-0"
            style={{
              width: "260px",
              position: "sticky",
              top: "64px",
              height: "calc(100vh - 64px)",
              overflowY: "auto",
            }}
          >
            <p
              className="px-7 pb-4 mb-2 text-[9px] font-bold uppercase tracking-[4px] opacity-40 border-b-2 border-[#1C293C]"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Contents
            </p>
            {TOC.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className={`flex items-center gap-3 px-7 py-3 no-underline text-[#1C293C] border-l-[3px] transition-all duration-100
                  ${
                    activeSection === t.id
                      ? "bg-[#FDC800] border-l-[#1C293C]"
                      : "border-l-transparent hover:bg-[#FDC800] hover:border-l-[#1C293C]"
                  }`}
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span className="text-[9px] font-bold opacity-40">{t.num}</span>
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] leading-[1.4]">
                  {t.label}
                </span>
              </a>
            ))}
          </aside>

          {/* Content */}
          <main className="flex-1 px-16 py-16 max-w-[820px]">
            {/* 01 OVERVIEW */}
            <section
              id="overview"
              className="mb-16 pb-16 border-b border-[rgba(28,41,60,0.08)]"
            >
              <SectionHeader
                num="01"
                title="OVERVIEW"
                subtitle="The short version"
              />
              <HighlightBox icon="⚡">
                CertGen is a 100% client-side web application. Your files,
                names, and certificate data are processed entirely inside your
                browser and <strong>never sent to any server</strong>. We don't
                collect, store, or transmit any personal information.
              </HighlightBox>
              <PolicyBody>
                <p>
                  This Privacy Policy explains how CertGen handles data when you
                  use our bulk certificate generation tool. Because CertGen
                  operates entirely in your browser, this policy is refreshingly
                  short: we don't have your data, and we never will.
                </p>
                <p>
                  By using CertGen, you agree to the practices described in this
                  policy. If you have any questions, see the Contact section at
                  the bottom.
                </p>
              </PolicyBody>
            </section>

            {/* 02 DATA WE HANDLE */}
            <section
              id="data"
              className="mb-16 pb-16 border-b border-[rgba(28,41,60,0.08)]"
            >
              <SectionHeader
                num="02"
                title="DATA WE HANDLE"
                subtitle="What you upload & what we see"
              />
              <PolicyBody>
                <p>
                  When you use CertGen, you interact with three types of data.
                  Here is exactly how each one is handled:
                </p>
              </PolicyBody>
              <div className="flex flex-wrap gap-2 my-4">
                <Tag color="yellow">🖼️ Certificate Template</Tag>
                <Tag color="yellow">📊 Excel / CSV File</Tag>
                <Tag color="yellow">🎛️ Placement Settings</Tag>
              </div>
              <ul className="space-y-3 mt-4">
                <CheckItem type="yes">
                  <span>
                    <strong>Certificate template image</strong> — loaded into
                    your browser memory only. Rendered on an HTML canvas
                    element. Never uploaded anywhere.
                  </span>
                </CheckItem>
                <CheckItem type="yes">
                  <span>
                    <strong>Excel / CSV file with names</strong> — parsed by the
                    SheetJS library running locally in your browser. The names
                    list exists only in JavaScript memory during your session.
                  </span>
                </CheckItem>
                <CheckItem type="yes">
                  <span>
                    <strong>Text placement settings</strong> (font, size, color,
                    position) — stored in React component state in your browser.
                    Cleared on page close or refresh.
                  </span>
                </CheckItem>
                <CheckItem type="no">
                  <span>
                    <strong>None of this data is ever sent to a server.</strong>{" "}
                    CertGen has no backend, no database, and no API endpoint
                    that receives your content.
                  </span>
                </CheckItem>
              </ul>
            </section>

            {/* 03 HOW IT WORKS */}
            <section
              id="how"
              className="mb-16 pb-16 border-b border-[rgba(28,41,60,0.08)]"
            >
              <SectionHeader
                num="03"
                title="HOW IT WORKS"
                subtitle="The technical data flow"
              />
              <PolicyBody>
                <p>
                  Understanding how CertGen processes data helps explain why
                  your privacy is inherently protected:
                </p>
              </PolicyBody>
              <DataFlow />
              <PolicyBody>
                <p>
                  Your file is read using the browser's native FileReader API.
                  The canvas element processes the image locally. The ZIP file
                  is assembled in memory using JSZip — a JavaScript library —
                  and downloaded directly to your device. At no point is any
                  network request made with your data.
                </p>
              </PolicyBody>
            </section>

            {/* 04 NO DATA STORAGE */}
            <section
              id="storage"
              className="mb-16 pb-16 border-b border-[rgba(28,41,60,0.08)]"
            >
              <SectionHeader
                num="04"
                title="NO DATA STORAGE"
                subtitle="What happens when you close the tab"
              />
              <DarkBox title="ZERO PERSISTENCE">
                CertGen does not use localStorage, sessionStorage, IndexedDB,
                cookies, or any other browser storage mechanism. When you close
                or refresh the page, all data is gone. Every session starts
                completely fresh.
              </DarkBox>
              <PolicyBody>
                <p>
                  We do not set any cookies — not tracking cookies, not
                  preference cookies, not authentication cookies. There are no
                  user accounts, no login sessions, and no persistent
                  identifiers of any kind.
                </p>
                <p>
                  Any data in memory during your session is freed by the
                  browser's garbage collector when you navigate away. CertGen
                  leaves no trace on your device.
                </p>
              </PolicyBody>
              <div className="flex flex-wrap gap-2 mt-4">
                <Tag color="red">✗ No localStorage</Tag>
                <Tag color="red">✗ No sessionStorage</Tag>
                <Tag color="red">✗ No Cookies</Tag>
                <Tag color="red">✗ No IndexedDB</Tag>
                <Tag color="red">✗ No Accounts</Tag>
              </div>
            </section>

            {/* 05 THIRD PARTIES */}
            <section
              id="thirdparty"
              className="mb-16 pb-16 border-b border-[rgba(28,41,60,0.08)]"
            >
              <SectionHeader
                num="05"
                title="THIRD PARTIES"
                subtitle="Libraries & fonts we load"
              />
              <PolicyBody>
                <p>
                  CertGen uses a small set of open-source JavaScript libraries
                  and web fonts. These are loaded from CDNs or bundled at build
                  time.{" "}
                  <strong>
                    None of them receive your certificate data or names.
                  </strong>
                </p>
              </PolicyBody>
              <ul className="space-y-3 mt-4">
                <CheckItem type="yes">
                  <span>
                    <strong>SheetJS (xlsx)</strong> — parses your Excel/CSV
                    files entirely in the browser. No data is sent to SheetJS
                    servers.
                  </span>
                </CheckItem>
                <CheckItem type="yes">
                  <span>
                    <strong>JSZip</strong> — assembles your ZIP file locally in
                    browser memory. No data is sent externally.
                  </span>
                </CheckItem>
                <CheckItem type="yes">
                  <span>
                    <strong>React & Framer Motion</strong> — UI rendering
                    libraries that operate purely in your browser.
                  </span>
                </CheckItem>
                <CheckItem type="yes">
                  <span>
                    <strong>Google Fonts</strong> — loads font files from
                    Google's CDN. Google may log the font request (standard CDN
                    behavior), but receives no data from your certificates or
                    names. You may self-host fonts to prevent this entirely.
                  </span>
                </CheckItem>
              </ul>
              <PolicyBody>
                <p className="mt-4">
                  We do not integrate any analytics platforms (Google Analytics,
                  Mixpanel, etc.), advertising networks, or user tracking
                  services of any kind.
                </p>
              </PolicyBody>
              <div className="flex flex-wrap gap-2 mt-4">
                <Tag color="green">✓ SheetJS</Tag>
                <Tag color="green">✓ JSZip</Tag>
                <Tag color="green">✓ React</Tag>
                <Tag color="blue">ℹ Google Fonts</Tag>
                <Tag color="red">✗ No Analytics</Tag>
                <Tag color="red">✗ No Ad Networks</Tag>
              </div>
            </section>

            {/* 06 YOUR RIGHTS */}
            <section
              id="rights"
              className="mb-16 pb-16 border-b border-[rgba(28,41,60,0.08)]"
            >
              <SectionHeader
                num="06"
                title="YOUR RIGHTS"
                subtitle="GDPR, PDPA & global compliance"
              />
              <PolicyBody>
                <p>
                  Because CertGen collects no personal data, the rights afforded
                  by privacy regulations (GDPR, PDPA, CCPA, etc.) are
                  automatically satisfied — there is nothing to access, correct,
                  delete, or export on our end.
                </p>
              </PolicyBody>
              <HighlightBox icon="🏛️">
                <strong>Philippines PDPA Compliance:</strong> CertGen does not
                collect, store, or process personal information as defined under
                Republic Act 10173 (Data Privacy Act of 2012). No NPC
                registration is required as no personal data is held or
                processed by CertGen servers.
              </HighlightBox>
              <ul className="space-y-3">
                <CheckItem type="yes">
                  <span>
                    <strong>Right to access</strong> — No data is held by us.
                    Nothing to access.
                  </span>
                </CheckItem>
                <CheckItem type="yes">
                  <span>
                    <strong>Right to erasure</strong> — Close the browser tab.
                    All session data is erased immediately.
                  </span>
                </CheckItem>
                <CheckItem type="yes">
                  <span>
                    <strong>Right to portability</strong> — You own all
                    generated certificates. They download directly to your
                    device.
                  </span>
                </CheckItem>
                <CheckItem type="yes">
                  <span>
                    <strong>Right to object</strong> — There is no processing to
                    object to. We never process your data.
                  </span>
                </CheckItem>
              </ul>
            </section>

            {/* 07 CONTACT */}
            <section id="contact" className="mb-0">
              <SectionHeader
                num="07"
                title="CONTACT"
                subtitle="Questions? Concerns? We're here."
              />
              <PolicyBody>
                <p>
                  If you have any questions about this Privacy Policy or how
                  CertGen handles data, we'd love to hear from you. Reach out
                  and we'll respond as soon as possible.
                </p>
              </PolicyBody>

              <div
                className="border-[3px] border-[#1C293C] p-10 grid gap-8 items-center mt-6"
                style={{
                  background: "#432DD7",
                  boxShadow: "6px 6px 0 #1C293C",
                  gridTemplateColumns: "1fr auto",
                }}
              >
                <div>
                  <h3
                    className="text-[32px] tracking-[2px] text-[#FDC800] mb-2"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    GET IN TOUCH
                  </h3>
                  <p className="text-[14px] text-white opacity-70 leading-[1.6]">
                    Questions about privacy, data handling, or anything else?
                    We'll get back to you quickly. No data is collected from
                    this contact either.
                  </p>
                </div>
                <a
                  href="mailto:hello@certgen.app"
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] px-7 py-4 bg-[#FDC800] text-[#1C293C] border-[3px] border-[#FDC800] no-underline whitespace-nowrap transition-all duration-100"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    boxShadow: "4px 4px 0 #1C293C",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translate(-3px,-3px)";
                    e.currentTarget.style.boxShadow = "6px 6px 0 #1C293C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "4px 4px 0 #1C293C";
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email Us
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t-[3px] border-[#1C293C] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
          <span
            className="text-[24px] tracking-[3px]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CertGen
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-[2px] opacity-40"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            © 2025 CertGen — Privacy by design
          </span>
          <div className="flex gap-6">
            {["Home", "Privacy", "Support"].map((l) => (
              <button
                key={l}
                onClick={l === "Home" ? onBack : undefined}
                className="text-[10px] font-bold uppercase tracking-[2px] text-[#1C293C] opacity-50 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
