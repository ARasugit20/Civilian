"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, useInView, useAnimation } from "framer-motion";
import Nav from "../components/Nav";
import { FORUM_THREADS } from "../lib/civicData";

// ── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

// ── Animated counter hook ────────────────────────────────────────────────────
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    if (end <= 0) {
      setCount(0);
      return;
    }
    setCount(0);
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return { count, ref };
}

// ── Live Demo Widget ─────────────────────────────────────────────────────────
const DEMO_TEXT = "The crosswalk at Mill Ave and University Dr has no lighting. My kids walk to school here and two near-misses happened this week.";
const DEMO_LOCATION = "Mill Ave & University Dr, Tempe, AZ";

const ANALYSIS_ROWS = [
  "Searching city records for current officials...",
  "Finding relevant Tempe ordinances and ARS statutes...",
  "Analyzing issue type: Traffic Safety",
  "Writing formal letter...",
];

function DemoWidget() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const runDemoRef = useRef(null);
  const [step, setStep] = useState(0); // 0=idle,1=typing,2=analyzing,3=letter,4=sent
  const [typedText, setTypedText] = useState("");
  const [typedLocation, setTypedLocation] = useState("");
  const [analysisRow, setAnalysisRow] = useState(0);
  const [doneRows, setDoneRows] = useState([]);
  const [letterVisible, setLetterVisible] = useState(false);
  const [sentVisible, setSentVisible] = useState(false);
  const timerRefs = useRef([]);

  function clearTimers() { timerRefs.current.forEach(clearTimeout); timerRefs.current = []; }

  function runDemo() {
    clearTimers();
    setStep(1); setTypedText(""); setTypedLocation(""); setAnalysisRow(0); setDoneRows([]); setLetterVisible(false); setSentVisible(false);

    // Step 1: type complaint
    let i = 0;
    function typeChar() {
      if (i < DEMO_TEXT.length) {
        setTypedText(DEMO_TEXT.slice(0, i + 1));
        i++;
        timerRefs.current.push(setTimeout(typeChar, 28));
      } else {
        // type location
        let j = 0;
        function typeLoc() {
          if (j < DEMO_LOCATION.length) {
            setTypedLocation(DEMO_LOCATION.slice(0, j + 1));
            j++;
            timerRefs.current.push(setTimeout(typeLoc, 40));
          } else {
            // Step 2: analyzing
            timerRefs.current.push(setTimeout(() => {
              setStep(2);
              let row = 0;
              function nextRow() {
                if (row < ANALYSIS_ROWS.length) {
                  setAnalysisRow(row);
                  timerRefs.current.push(setTimeout(() => {
                    setDoneRows(prev => [...prev, row]);
                    row++;
                    timerRefs.current.push(setTimeout(nextRow, 300));
                  }, 600));
                } else {
                  // Step 3: letter
                  timerRefs.current.push(setTimeout(() => {
                    setStep(3);
                    timerRefs.current.push(setTimeout(() => setLetterVisible(true), 200));
                    // Step 4: sent
                    timerRefs.current.push(setTimeout(() => {
                      setStep(4);
                      setSentVisible(true);
                    }, 3500));
                  }, 400));
                }
              }
              nextRow();
            }, 400));
          }
        }
        timerRefs.current.push(setTimeout(typeLoc, 300));
      }
    }
    typeChar();
  }

  runDemoRef.current = runDemo;

  const demoStarted = useRef(false);

  useEffect(() => {
    if (!inView) return undefined;
    if (!demoStarted.current) {
      demoStarted.current = true;
      runDemoRef.current?.();
    }
    return clearTimers;
  }, [inView]);

  // If intersection never fires (layout, slow paint), still start the demo after a short delay.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!demoStarted.current) {
        demoStarted.current = true;
        runDemoRef.current?.();
      }
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const stepLabels = ["Describe", "AI Analyzes", "Letter Written", "Sent"];

  return (
    <div ref={ref} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 20, padding: "36px 40px", maxWidth: 800, margin: "0 auto", position: "relative" }}>
      {/* Replay button */}
      <button onClick={runDemo} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.08)", border: "1px solid #30363d", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#8b949e", cursor: "pointer" }}>
        Replay
      </button>

      {/* Progress steps */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32, position: "relative" }}>
        <div style={{ position: "absolute", top: 11, left: 12, right: 12, height: 2, background: "#30363d", zIndex: 0 }} />
        {stepLabels.map((label, i) => {
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginBottom: 8, transition: "all 0.3s", background: done ? "#22c55e" : active ? "#2563eb" : "#21262d", border: `2px solid ${done ? "#22c55e" : active ? "#2563eb" : "#30363d"}`, color: done || active ? "white" : "#8b949e" }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: done ? "#22c55e" : active ? "#58a6ff" : "#8b949e", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Typing */}
      {(step === 1) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
            <p style={{ fontSize: 14, color: "#e6edf3", lineHeight: 1.65, minHeight: 80, fontFamily: "monospace" }}>
              {typedText}<span style={{ animation: "blink 1s step-end infinite", borderRight: "2px solid #58a6ff" }}>&nbsp;</span>
            </p>
          </div>
          <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ fontSize: 13, color: typedLocation ? "#e6edf3" : "#8b949e", fontFamily: "monospace" }}>{typedLocation || "Location..."}</span>
          </div>
          {typedText.length === DEMO_TEXT.length && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: 16 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 999, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontSize: 14, fontWeight: 600, boxShadow: "0 0 20px rgba(37,99,235,0.4)", animation: "pulse 2s ease-in-out infinite" }}>
                Find My Voice →
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 2: Analyzing */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 12, padding: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, rgba(37,99,235,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
            {ANALYSIS_ROWS.map((row, i) => {
              const isDone = doneRows.includes(i);
              const isActive = analysisRow === i && !isDone;
              if (i > analysisRow && !isDone) return null;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, fontSize: 13, color: isDone ? "#22c55e" : isActive ? "#58a6ff" : "#8b949e" }}>
                  {isDone ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <div style={{ width: 16, height: 16, border: "2px solid #58a6ff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                  )}
                  {row}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Step 3 & 4: Letter + Sent */}
      {(step === 3 || step === 4) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: letterVisible ? 1 : 0 }} transition={{ duration: 0.4 }}>
          {/* Official card */}
          <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.15))", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3" }}>Kevin Mattingly</p>
              <p style={{ fontSize: 12, color: "#58a6ff" }}>Public Works Director · publicworks@tempe.gov</p>
            </div>
          </div>

          {/* Letter */}
          <div style={{ background: "#0d1117", border: `1px solid ${step === 4 ? "rgba(34,197,94,0.4)" : "#30363d"}`, borderRadius: 12, padding: "16px", marginBottom: 12, transition: "border-color 0.5s", boxShadow: step === 4 ? "0 0 20px rgba(34,197,94,0.1)" : "none" }}>
            <p style={{ fontSize: 13, color: "#e6edf3", lineHeight: 1.7, fontFamily: "monospace" }}>
              Dear Director Mattingly,<br /><br />
              We, the undersigned residents of Mill Avenue, formally request installation of pedestrian lighting at the intersection of Mill Ave and University Drive. Per Arizona Revised Statute § 28-792, municipalities are required to maintain pedestrian safety near school zones...<br />
              <span style={{ color: "#58a6ff", cursor: "pointer" }}>View full letter →</span>
            </p>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ padding: "3px 8px", borderRadius: 999, background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.3)", fontSize: 10, fontWeight: 600, color: "#58a6ff" }}>Generated by Claude AI · Web search verified</div>
            </div>
          </div>

          {/* Sent state */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: sentVisible ? 1 : 0, y: sentVisible ? 0 : 8 }} transition={{ duration: 0.4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 14, fontWeight: 600, color: "#22c55e" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Letter sent to Kevin Mattingly
              </div>
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: -4 }}>
                    {[1,2,3].map(n => <img key={n} src={`https://i.pravatar.cc/150?img=${n * 7}`} alt="" style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #161b22", marginLeft: n > 1 ? -8 : 0 }} />)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>34 neighbors have reported this same issue</span>
                </div>
                <div style={{ height: 6, background: "#21262d", borderRadius: 999, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ duration: 1, delay: 0.3 }} style={{ height: "100%", background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: 999 }} />
                </div>
                <p style={{ fontSize: 11, color: "#8b949e", marginTop: 6 }}>16 more voices needed for City Council escalation</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Idle state */}
      {step === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#8b949e", fontSize: 14 }}>Loading demo...</div>
      )}

      {/* Bottom CTAs */}
      {step === 4 && sentVisible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Link href="/compose" style={{ flex: 1, textAlign: "center", padding: "11px", borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            Try it yourself →
          </Link>
          <Link href="/forum" style={{ flex: 1, textAlign: "center", padding: "11px", borderRadius: 10, border: "1px solid #30363d", color: "#8b949e", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            See all community issues
          </Link>
        </motion.div>
      )}
    </div>
  );
}

// ── Bento Feature Cards ──────────────────────────────────────────────────────
const BENTO = [
  {
    cols: 2, title: "AI-Powered Letter Writing", body: "Our AI searches city records, finds the current official, and writes a legally-grounded letter citing real ordinances.",
    color: "#2563eb", tall: true,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    cols: 1, title: "Photo Evidence", body: "Attach photos. Claude Vision analyzes and references them in your formal letter.",
    color: "#06b6d4",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  },
  {
    cols: 1, title: "Collective Power", body: "Issues auto-escalate to City Council at 50 voices.",
    color: "#22c55e",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    cols: 1, title: "Real Officials Found", body: "AI web-searches for the current real official — not an outdated directory.",
    color: "#8b5cf6", tall: true,
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  },
  {
    cols: 2, title: "Issue Tracking", body: "Follow your issue from report to resolution. See when officials respond.",
    color: "#f59e0b",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    cols: 1, title: "Community Reels", body: "Upload short videos of issues. Your community sees and echoes.",
    color: "#ef4444",
    image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=600",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  },
];

// ── Neighborhood Health Score Widget ────────────────────────────────────────
function HealthScoreWidget() {
  const { count: score, ref } = useCounter(74, 1800);
  const healthColor = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Healthy" : score >= 60 ? "Needs Attention" : "Critical";
  return (
    <div ref={ref} style={{ display: "inline-flex", alignItems: "center", gap: 32, background: "#161b22", border: "1px solid #30363d", borderRadius: 20, padding: "24px 40px", margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#8b949e", marginBottom: 8 }}>Tempe Neighborhood Health</p>
        <p style={{ fontSize: 72, fontWeight: 800, color: healthColor, letterSpacing: -4, lineHeight: 1 }}>{score}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: healthColor, marginTop: 4 }}>{label}</p>
      </div>
      <div style={{ width: 1, height: 80, background: "#30363d" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Green 80+", color: "#22c55e", active: score >= 80 },
          { label: "Amber 60–79", color: "#f59e0b", active: score >= 60 && score < 80 },
          { label: "Red below 60", color: "#ef4444", active: score < 60 },
        ].map((tier) => (
          <div key={tier.label} style={{ display: "flex", alignItems: "center", gap: 8, opacity: tier.active ? 1 : 0.35 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: tier.color }} />
            <span style={{ fontSize: 12, color: tier.active ? "#e6edf3" : "#8b949e", fontWeight: tier.active ? 600 : 400 }}>{tier.label}</span>
          </div>
        ))}
        <p style={{ fontSize: 11, color: "#8b949e", marginTop: 4 }}>100 − (unresolved × 2)</p>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
function isResolvedStatus(s) {
  const x = String(s || "").toLowerCase();
  return x === "resolved" || x.includes("resolved");
}

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then(r => r.json())
      .then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const { totalVoices, totalLetters, totalResolved } = useMemo(() => {
    const db = Array.isArray(posts) ? posts : [];
    const threadVoices = FORUM_THREADS.reduce((s, t) => s + (Number(t.support) || 0), 0);
    const dbVoices = db.reduce((s, p) => s + (Number(p.echo_count) || 0), 0);
    const voices = threadVoices + dbVoices;

    const letters =
      db.filter((p) => (p.formal_request && String(p.formal_request).trim()) || p.complaint).length +
      FORUM_THREADS.filter((t) => t.text).length;

    const resolvedDb = db.filter((p) => isResolvedStatus(p.status)).length;
    const resolvedDemo = FORUM_THREADS.filter((t) => isResolvedStatus(t.status) || t.gov_response).length;
    const resolved = resolvedDb + resolvedDemo;

    return { totalVoices: voices, totalLetters: letters, totalResolved: resolved };
  }, [posts]);

  const voices = useCounter(totalVoices, 1200);
  const letters = useCounter(totalLetters, 1200);
  const resolved = useCounter(totalResolved, 1200);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {/* Hero background image */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.06 }} />
        {/* Blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1152, margin: "0 auto", padding: "80px 32px", width: "100%" }}>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
            style={{ fontSize: "clamp(52px,7vw,88px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: -4, color: "var(--text)", marginBottom: 32 }}>
            Your city.<br />Your voice.<br />
            <span style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Your change.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
            style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
            Describe any problem in your own words. AI finds the right official, writes a formal letter citing real law, and rallies your community.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            <Link href="/compose" className="nav-btn" style={{ padding: "14px 32px", fontSize: 15 }}>Join the Movement</Link>
            <a href="#demo" style={{ padding: "14px 32px", borderRadius: 999, fontWeight: 600, fontSize: 15, border: "1px solid var(--border)", color: "var(--muted)", textDecoration: "none", background: "var(--surface)", transition: "all 0.15s" }}>
              See How It Works
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 24, padding: "14px 24px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--card-shadow)", fontSize: 14 }}>
            {[[loading ? "—" : totalVoices.toLocaleString(), "voices raised"], [loading ? "—" : totalLetters.toLocaleString(), "letters sent"], [loading ? "—" : totalResolved.toLocaleString(), "issues resolved"]].map(([val, lbl], i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)" }}>
                {i > 0 && <span style={{ width: 1, height: 16, background: "var(--border)", marginRight: 18 }} />}
                <strong style={{ color: "var(--text)" }}>{val}</strong> {lbl}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 2 — LIVE DEMO ═══ */}
      <section id="demo" style={{ padding: "96px 0", background: "#0d1117" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: "center", marginBottom: 56 }}>
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#58a6ff", marginBottom: 12 }}>SEE IT IN ACTION</motion.p>
            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, letterSpacing: -2, color: "#e6edf3", marginBottom: 16 }}>
              From problem to government action<br />in 30 seconds.
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, color: "#8b949e", maxWidth: 560, margin: "0 auto" }}>
              Watch AI turn your complaint into an official letter, routed to the right authority, backed by real law.
            </motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <DemoWidget />
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 3 — BENTO FEATURES ═══ */}
      <section style={{ padding: "96px 0", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: "center", marginBottom: 48 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 800, letterSpacing: -1.5, color: "var(--text)", marginBottom: 12 }}>
              Everything your community needs
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: "var(--muted)", fontSize: 16 }}>Built for real civic action, not just complaints.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {BENTO.map((card, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ gridColumn: `span ${card.cols}`, borderRadius: 20, overflow: "hidden", boxShadow: "var(--card-shadow)", position: "relative", minHeight: card.tall ? 280 : 220, border: "1px solid var(--border)" }}>
                {/* Background image */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${card.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                {/* Gradient overlay */}
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${card.color}cc 0%, rgba(0,0,0,0.85) 100%)` }} />
                {/* Content */}
                <div style={{ position: "relative", zIndex: 1, padding: "28px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 14 }}>
                    {card.icon}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 6 }}>{card.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{card.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 4 — SCROLL SHOWCASE ═══ */}
      <section style={{ padding: "96px 0", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          {/* Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", marginBottom: 96 }}>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--blue)", marginBottom: 12 }}>COMMUNITY FEED</p>
              <h2 style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, letterSpacing: -1, color: "var(--text)", marginBottom: 16 }}>Your neighborhood's living feed</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>See what your neighbors are reporting in real time. Echo issues you care about. Comment. Share. Build collective momentum.</p>
              <Link href="/forum" style={{ fontSize: 14, fontWeight: 600, color: "var(--blue)", textDecoration: "none" }}>Explore the feed →</Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", transform: "rotate(-1.5deg)" }}>
                <img src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&fit=crop&crop=faces" alt="Community meeting" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "center top", display: "block" }} />
              </div>
            </motion.div>
          </div>

          {/* Row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", marginBottom: 96 }}>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", transform: "rotate(1.5deg)" }}>
                <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600" alt="City map" style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--blue)", marginBottom: 12 }}>LIVE MAP</p>
              <h2 style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, letterSpacing: -1, color: "var(--text)", marginBottom: 16 }}>See your city's pressure points</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>Interactive map shows every reported issue. Filter by type. Click to view. See where problems cluster.</p>
              <Link href="/map" style={{ fontSize: 14, fontWeight: 600, color: "var(--blue)", textDecoration: "none" }}>Open the map →</Link>
            </motion.div>
          </div>

          {/* Row 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--blue)", marginBottom: 12 }}>AUTONOMOUS AI AGENT</p>
              <h2 style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, letterSpacing: -1, color: "var(--text)", marginBottom: 16 }}>AI that follows up for you</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 16 }}>If officials don't respond in 7 days, Civilian automatically sends a follow-up letter. You don't have to chase anyone.</p>
              <a href="https://agent.tinyfish.ai" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--muted)", textDecoration: "none", marginBottom: 16, border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 999 }}>
                Powered by TinyFish
              </a>
              <br />
              <Link href="/compose" style={{ fontSize: 14, fontWeight: 600, color: "var(--blue)", textDecoration: "none" }}>See how it works →</Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 16, padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                {[
                  { label: "Day 1: Letter sent", done: true, delay: 0 },
                  { label: "Day 7: No response detected", done: true, delay: 0.3 },
                  { label: "Day 7: Follow-up sent automatically", done: true, delay: 0.6 },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: s.delay, duration: 0.4 }}
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 2 ? 16 : 0, fontSize: 13, color: "#e6edf3" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    {s.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 — STATS ═══ */}
      <section style={{ padding: "96px 0", background: "#0d1117" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", gap: 64, marginBottom: 56, flexWrap: "wrap" }}>
              {[
                { ref: voices.ref, count: voices.count, suffix: "", label: "Voices raised citywide" },
                { ref: letters.ref, count: letters.count, suffix: "", label: "Official letters sent" },
                { ref: resolved.ref, count: resolved.count, suffix: "", label: "Issues resolved this month" },
              ].map((stat, i) => (
                <div key={i} ref={stat.ref} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "clamp(40px,5vw,64px)", fontWeight: 800, color: "#e6edf3", letterSpacing: -3, lineHeight: 1 }}>
                    {stat.count.toLocaleString()}{stat.suffix}
                  </p>
                  <p style={{ fontSize: 14, color: "#8b949e", marginTop: 8 }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Neighborhood Health Score */}
            <motion.div variants={fadeUp} style={{ marginBottom: 48 }}>
              <HealthScoreWidget />
            </motion.div>

            {/* Quote */}
            <motion.div variants={fadeUp} style={{ background: "#161b22", border: "1px solid #30363d", borderLeft: "4px solid #22c55e", borderRadius: 16, padding: "28px 32px", maxWidth: 680, margin: "0 auto", textAlign: "left" }}>
              <p style={{ fontSize: 16, color: "#e6edf3", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
                "I reported the pothole on Apache Blvd through Civilian. 47 neighbors echoed it. Within 3 weeks, the city patched it. This actually works."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src="https://i.pravatar.cc/150?img=12" alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>Roberto G.</p>
                  <p style={{ fontSize: 12, color: "#8b949e" }}>Tempe Homeowner</p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 6 — RESOLVED SHOWCASE ═══ */}
      <section style={{ padding: "96px 0", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            style={{ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 800, letterSpacing: -1.5, color: "var(--text)", textAlign: "center", marginBottom: 48 }}>
            Real change. Tracked.
          </motion.h2>

          {/* Community image strip */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ marginBottom: 40 }}>
            <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&fit=crop" alt="City skyline" style={{ width: "100%", height: 200, objectFit: "cover", objectPosition: "center 60%", borderRadius: 16, display: "block" }} />
          </motion.div>

          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollSnapType: "x mandatory" }}>
            {[
              { issue: "Kiwanis Park shade structures were torn and benches broken near the children's area.", voices: 48, days: 14, location: "Kiwanis Park, Tempe" },
              { issue: "Pothole on Apache Blvd kept damaging tires and had been there for months.", voices: 56, days: 21, location: "Apache Blvd, Tempe" },
              { issue: "Crosswalk markings at Mill Ave and University were completely faded.", voices: 34, days: 10, location: "Mill Ave & University Dr" },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ minWidth: 360, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", boxShadow: "var(--card-shadow)", scrollSnapAlign: "start", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>RESOLVED</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{card.location}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>"{card.issue}"</p>
                <div style={{ display: "flex", gap: 24 }}>
                  {[[card.voices, "voices"], [card.days, "days to fix"], ["1", "policy changed"]].map(([v, l], j) => (
                    <div key={j}>
                      <p style={{ fontSize: 20, fontWeight: 800, color: j === 1 ? "#22c55e" : j === 2 ? "#2563eb" : "var(--text)", letterSpacing: -0.5 }}>{v}</p>
                      <p style={{ fontSize: 11, color: "var(--muted)" }}>{l}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7 — CTA BANNER ═══ */}
      <section style={{ padding: "96px 0", background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, letterSpacing: -2, color: "white", marginBottom: 16 }}>
              Ready to make your voice heard?
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 36 }}>
              Join residents already making change in their community.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/compose" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", borderRadius: 999, background: "white", color: "#2563eb", textDecoration: "none", fontSize: 16, fontWeight: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                Start Reporting Free →
              </Link>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 16 }}>No account needed · Anonymous by default · AI does the work</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", letterSpacing: 0.5 }}>Works offline</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "rgba(37,99,235,0.2)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.3)", letterSpacing: 0.5 }}>70+ languages</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)", letterSpacing: 0.5 }}>Installs on mobile</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 20px rgba(37,99,235,0.4)} 50%{box-shadow:0 0 32px rgba(37,99,235,0.7)} }
      `}</style>
    </div>
  );
}
