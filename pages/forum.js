import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import Toast from "../components/Toast";
import { ISSUE_COLORS, FORUM_THREADS } from "../lib/civicData";
import EchoConsentDialog from "../components/EchoConsentDialog";

const LANG_NAMES = {
  en: "English", fr: "French", es: "Spanish", de: "German", it: "Italian",
  pt: "Portuguese", ru: "Russian", zh: "Chinese", ja: "Japanese", ko: "Korean",
  ar: "Arabic", hi: "Hindi", vi: "Vietnamese", tl: "Filipino", so: "Somali",
  am: "Amharic", nl: "Dutch", pl: "Polish", sv: "Swedish", tr: "Turkish", uk: "Ukrainian",
};

const COUNTRY_LANG_MAP = {
  us: "en", gb: "en", au: "en", ca: "en", fr: "fr", de: "de", es: "es", it: "it",
  pt: "pt", ru: "ru", jp: "ja", cn: "zh", kr: "ko", sa: "ar", in: "hi", mx: "es",
  br: "pt", nl: "nl", pl: "pl", se: "sv", tr: "tr", ua: "uk",
};

// Lightweight rule-based language detector using unique character sets and common words
function detectLang(text) {
  if (!text || text.length < 10) return null;
  const t = text.toLowerCase();
  // Script-based detection (fast, reliable)
  if (/[\u4e00-\u9fff]/.test(t)) return "zh";
  if (/[\u3040-\u30ff]/.test(t)) return "ja";
  if (/[\uac00-\ud7af]/.test(t)) return "ko";
  if (/[\u0600-\u06ff]/.test(t)) return "ar";
  if (/[\u0900-\u097f]/.test(t)) return "hi";
  if (/[\u0400-\u04ff]/.test(t)) return "ru";
  // Latin-script languages — common word fingerprints
  const frWords = /\b(le|la|les|un|une|des|est|sont|avec|pour|dans|sur|que|qui|pas|plus|très|aussi|mais|ou|et|il|elle|nous|vous|ils|elles|ce|se|au|du|en|je|tu|on|ne|par|tout|bien|comme|avoir|être|faire|aller|voir|venir|savoir|pouvoir|vouloir|lampadaire|rue|depuis|semaines|dangereux|nuit|piétons|cyclistes|passent|devant)\b/g;
  const esWords = /\b(el|la|los|las|un|una|unos|unas|es|son|con|para|en|sobre|que|quien|no|más|muy|también|pero|o|y|él|ella|nosotros|vosotros|ellos|ellas|este|ese|al|del|por|todo|bien|como|tener|ser|hacer|ir|ver|venir|saber|poder|querer)\b/g;
  const deWords = /\b(der|die|das|ein|eine|ist|sind|mit|für|in|auf|dass|wer|nicht|mehr|sehr|auch|aber|oder|und|er|sie|wir|ihr|sie|dieser|jener|zum|vom|durch|alles|gut|wie|haben|sein|machen|gehen|sehen|kommen|wissen|können|wollen)\b/g;
  const itWords = /\b(il|la|i|le|un|una|è|sono|con|per|in|su|che|chi|non|più|molto|anche|ma|o|e|lui|lei|noi|voi|loro|questo|quello|al|del|da|tutto|bene|come|avere|essere|fare|andare|vedere|venire|sapere|potere|volere)\b/g;
  const scores = {
    fr: (t.match(frWords) || []).length,
    es: (t.match(esWords) || []).length,
    de: (t.match(deWords) || []).length,
    it: (t.match(itWords) || []).length,
  };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best[1] >= 2) return best[0];
  // Accent character hints
  if (/[àâçéèêëîïôùûüÿœæ]/.test(t)) return "fr";
  if (/[áéíóúüñ¿¡]/.test(t)) return "es";
  if (/[äöüß]/.test(t)) return "de";
  if (/[àèéìíîòóùú]/.test(t)) return "it";
  return null; // can't determine — treat as unknown, don't show banner
}

const FILTERS = [
  { key: "all",              label: "All Issues"    },
  { key: "traffic_safety",   label: "Traffic"       },
  { key: "road_maintenance", label: "Roads"         },
  { key: "parks_facilities", label: "Parks"         },
  { key: "street_lighting",  label: "Lighting"      },
  { key: "noise_complaint",  label: "Noise"         },
  { key: "housing",          label: "Housing"       },
];

const DUMMY_COMMENTS = [
  { id: "d1", author_name: "Maria S.", text: "This has been an issue for months! My kids almost got hit last week.", created_at: "2h ago" },
  { id: "d2", author_name: "James T.", text: "I reported this to 311 twice. Nothing happened. This platform is our last hope.", created_at: "5h ago" },
  { id: "d3", author_name: "Chen W.", text: "47 of us signed the letter. Sending it tomorrow morning.", created_at: "1d ago" },
];

const TIER_MILESTONES = [
  { threshold: 10, label: "10 voices = Dept Notified",      color: "#f59e0b" },
  { threshold: 25, label: "25 voices = Council Escalation", color: "#f97316" },
  { threshold: 50, label: "50 voices = Public Records",     color: "#ef4444" },
];

function timeAgo(idx) {
  return ["2h ago","5h ago","1d ago","3d ago","6h ago","12h ago","4h ago","8h ago"][idx % 8];
}
function getInitials(name) {
  return (name || "A").split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
}
function getAvatarColor(name) {
  const colors = ["#2563eb","#6366f1","#8b5cf6","#f59e0b","#22c55e","#ef4444","#f97316"];
  let h = 0;
  for (let i = 0; i < (name||"").length; i++) h = (name||"").charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ── Share Menu ──────────────────────────────────────────────────────────────
function ShareMenu({ postId, onClose, onCopied }) {
  const ref = useRef(null);
  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : "";
  const enc = encodeURIComponent(postUrl);
  const msg = encodeURIComponent("Check this community issue: " + postUrl);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const options = [
    { label: "Copy Link",         action: () => { navigator.clipboard.writeText(postUrl); onCopied(); onClose(); }, color: "#2563eb" },
    { label: "Share on X",        href: `https://twitter.com/intent/tweet?text=I%20raised%20a%20civic%20issue%20on%20Civilian.%20Join%20me!&url=${enc}`, color: "#000" },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`, color: "#1877f2" },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${msg}`, color: "#25d366" },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`, color: "#0a66c2" },
  ];

  return (
    <div ref={ref} style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", minWidth: 200, overflow: "hidden" }}>
      {options.map(opt => (
        opt.href ? (
          <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
            {opt.label}
          </a>
        ) : (
          <button key={opt.label} onClick={opt.action}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
            {opt.label}
          </button>
        )
      ))}
    </div>
  );
}

// ── Comments Panel ───────────────────────────────────────────────────────────
function CommentsPanel({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [likedIds, setLikedIds] = useState(new Set());

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then(r => r.json())
      .then(d => { const real = Array.isArray(d) ? d : []; setComments(real.length > 0 ? real : DUMMY_COMMENTS); setLoading(false); })
      .catch(() => { setComments(DUMMY_COMMENTS); setLoading(false); });
    const saved = JSON.parse(localStorage.getItem("likedComments") || "[]");
    setLikedIds(new Set(saved));
  }, [postId]);

  async function postComment() {
    if (!text.trim()) return;
    const optimistic = { id: Date.now(), text, author_name: "Anonymous", created_at: "just now" };
    setComments(prev => [...prev, optimistic]);
    setText("");
    try { await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post_id: postId, text: optimistic.text, author_name: "Anonymous" }) }); } catch {}
  }

  function toggleLike(id) {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("likedComments", JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div>
      {loading ? <p style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Loading...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: getAvatarColor(c.author_name || "A"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>
                {getInitials(c.author_name || "Anonymous")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{c.author_name || "Anonymous"}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{typeof c.created_at === "string" && c.created_at.includes("ago") ? c.created_at : c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{c.text}</p>
              </div>
              <button onClick={() => toggleLike(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: likedIds.has(c.id) ? "#ef4444" : "var(--muted)", padding: "2px 4px", alignSelf: "flex-start", marginTop: 2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={likedIds.has(c.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input type="text" placeholder="Add your voice..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && postComment()}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none" }} />
        <button onClick={postComment} disabled={!text.trim()} style={{ padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !text.trim() ? 0.5 : 1 }}>Post</button>
      </div>
    </div>
  );
}

// ── Post Modal ───────────────────────────────────────────────────────────────
function PostModal({ post, echoedIds, onEcho, onClose, onToast }) {
  const c = ISSUE_COLORS[post.issue_type || post.issueType] || ISSUE_COLORS.other;
  const [echoed, setEchoed] = useState(echoedIds.has(String(post.id)));
  const [echoCount, setEchoCount] = useState(post.echo_count ?? post.support ?? 0);
  const [letterExpanded, setLetterExpanded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const isDemo = String(post.id).startsWith("demo");
  const echoes = Number(echoCount) || 0;
  const urgency = post.urgency_score || 0;

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  async function handleEcho() {
    if (echoed) return;
    const consentKey = `civilian_consent_${post.id}`;
    const alreadyConsented = localStorage.getItem(consentKey) === "true";
    if (!alreadyConsented) { setShowConsent(true); return; }
    await doEcho();
  }

  async function doEcho() {
    const saved = JSON.parse(localStorage.getItem("echoed_posts") || "[]");
    if (saved.includes(String(post.id))) { setEchoed(true); return; }
    if (typeof window !== "undefined") {
      import("canvas-confetti").then(m => {
        m.default({ particleCount: 60, spread: 70, colors: ["#2563eb","#7c3aed","#22c55e"], origin: { y: 0.8 } });
      }).catch(() => {});
    }
    setEchoed(true);
    setEchoCount(n => n + 1);
    onEcho(String(post.id));
    localStorage.setItem(`civilian_consent_${post.id}`, "true");
    localStorage.setItem("echoed_posts", JSON.stringify([...saved, String(post.id)]));
    if (!isDemo) {
      try { await fetch("/api/echo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, alreadyEchoed: false }) }); } catch {}
    }
  }

  const letter = post.formal_request || "";
  const letterLines = letter.split("\n");
  const letterPreview = letterLines.slice(0, 3).join("\n");
  const lifecycleSteps = [
    { label: "Reported", done: true },
    { label: "Letter Sent", done: false },
    { label: "Responded", done: post.status === "responded" || post.status === "resolved" },
    { label: "Resolved", done: post.status === "resolved" },
  ];

  // Petition PDF download
  async function downloadPetition() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setFont("helvetica","bold");
    doc.text("COMMUNITY PETITION", 105, 20, { align: "center" });
    doc.setFontSize(11); doc.setFont("helvetica","normal");
    doc.text(`Issue: ${post.complaint || post.text}`, 20, 35, { maxWidth: 170 });
    doc.text(`Location: ${post.location || "Tempe, AZ"}`, 20, 55);
    doc.text(`Category: ${c.label}`, 20, 63);
    doc.text(`Voices: ${echoCount} Tempe Residents`, 20, 71);
    if (letter) {
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(letter, 170);
      doc.text(lines, 20, 85);
    }
    doc.setFontSize(10); doc.setFont("helvetica","italic");
    doc.text(`Signed by ${echoCount} Tempe Residents — Generated by Civilian`, 105, 280, { align: "center" });
    doc.save(`petition-${post.id}.pdf`);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", maxWidth: 900, width: "100%", maxHeight: "90vh", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        {post.image_url && (
          <div style={{ width: "55%", flexShrink: 0, position: "relative" }}>
            <img src={post.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ flex: 1, background: "var(--surface)", display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: getAvatarColor(post.author_name || "A"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>
              {getInitials(post.author_name || "Anonymous")}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{post.author_name || "Anonymous Resident"}</p>
              <span className="post-type" style={{ background: `${c.border}22`, color: c.border, margin: 0, fontSize: 10 }}>{c.label}</span>
            </div>
            {urgency >= 8 && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440", letterSpacing: 0.5 }}>URGENT</span>
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 22, lineHeight: 1, padding: 4 }}>&times;</button>
          </div>
          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", lineHeight: 1.5, marginBottom: 8 }}>{post.complaint || post.text}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>{post.location || "Tempe, AZ"}</p>
            {post.official_name && (
              <div style={{ background: "var(--blue-light)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--blue)", marginBottom: 8 }}>Letter goes to</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{post.official_name}</p>
                <p style={{ fontSize: 12, color: "var(--blue)" }}>{post.department}</p>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>{post.official_email}</p>
              </div>
            )}
            {/* Government response */}
            {post.gov_response && (
              <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#22c55e", marginBottom: 8 }}>Official Response</p>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, whiteSpace: "pre-line" }}>{post.gov_response}</p>
              </div>
            )}
            {letter && (
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 8 }}>Formal Letter</p>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, whiteSpace: "pre-line" }}>
                  {letterExpanded ? letter : letterPreview + (letterLines.length > 3 ? "..." : "")}
                </p>
                {letterLines.length > 3 && (
                  <button onClick={() => setLetterExpanded(v => !v)} style={{ fontSize: 12, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", marginTop: 6, padding: 0, fontWeight: 600 }}>
                    {letterExpanded ? "Show less" : "Read full letter"}
                  </button>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {TIER_MILESTONES.map(t => (
                <div key={t.threshold} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `1px solid ${echoes >= t.threshold ? t.color + "66" : "var(--border)"}`, background: echoes >= t.threshold ? t.color + "15" : "var(--bg)", opacity: echoes >= t.threshold ? 1 : 0.5 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: echoes >= t.threshold ? t.color : "var(--muted)", lineHeight: 1.4 }}>{t.label}</p>
                </div>
              ))}
            </div>
            {/* Lifecycle */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 12 }}>Issue Lifecycle</p>
              <div style={{ display: "flex", position: "relative" }}>
                <div style={{ position: "absolute", top: 9, left: 10, right: 10, height: 2, background: "var(--border)", zIndex: 0 }} />
                {lifecycleSteps.map((s, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: s.done ? "#22c55e" : "var(--surface)", border: `2px solid ${s.done ? "#22c55e" : "var(--border)"}`, marginBottom: 6 }} />
                    <p style={{ fontSize: 10, fontWeight: 600, color: s.done ? "var(--text)" : "var(--muted)", textAlign: "center" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Petition download at 25+ */}
            {echoes >= 25 && (
              <button onClick={downloadPetition} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(37,99,235,0.4)", background: "rgba(37,99,235,0.08)", color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Petition PDF ({echoCount} signatures)
              </button>
            )}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Comments</p>
              <CommentsPanel postId={post.id} />
            </div>
          </div>
          {/* Action bar */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={handleEcho} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: "none", cursor: echoed ? "default" : "pointer", background: echoed ? "rgba(37,99,235,0.12)" : "linear-gradient(135deg,#2563eb,#7c3aed)", color: echoed ? "#2563eb" : "white", fontSize: 13, fontWeight: 600, transition: "all 0.15s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={echoed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
              {echoed ? "Echoed" : "Echo"} · {echoCount}
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowShare(v => !v); }} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", position: "relative" }}>
              Share
              {showShare && (
                <div style={{ position: "fixed", bottom: 80, right: 40, zIndex: 2000, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", minWidth: 200, overflow: "hidden" }}>
                  {[
                    { label: "Copy Link", action: () => { const url = `${window.location.origin}/post/${post.id}`; navigator.clipboard.writeText(url); onToast({ message: "Link copied!", type: "success" }); setShowShare(false); } },
                    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=Civic%20issue%20on%20Civilian&url=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : "")}` },
                    { label: "Share on WhatsApp", href: `https://wa.me/?text=${encodeURIComponent("Check this community issue: " + (typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : ""))}` },
                    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : "")}` },
                  ].map(opt => opt.href ? (
                    <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" onClick={() => setShowShare(false)} style={{ display: "block", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{opt.label}</a>
                  ) : (
                    <button key={opt.label} onClick={opt.action} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", background: "transparent", border: "none", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{opt.label}</button>
                  ))}
                </div>
              )}
            </button>
            <Link href={`/post/${post.id}`} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center" }}>Full view</Link>
          </div>
        </div>
      </div>
      {showConsent && (
        <EchoConsentDialog
          post={post}
          onConfirm={() => { setShowConsent(false); doEcho(); }}
          onCancel={() => setShowConsent(false)}
        />
      )}
    </div>
  );
}

// ── Similarity Banner ────────────────────────────────────────────────────────
function SimilarityBanner({ posts, newIssueType, newLocation, onMerge }) {
  const similar = posts.filter(p =>
    (p.issue_type || p.issueType) === newIssueType &&
    p.location && newLocation &&
    p.location.toLowerCase().split(",")[0].trim() === newLocation.toLowerCase().split(",")[0].trim()
  );
  if (similar.length < 3) return null;
  const totalVoices = similar.reduce((s, p) => s + (p.echo_count || p.support || 0), 0);
  return (
    <div style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
          {totalVoices} people already reported this
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Join their fight instead of starting a new thread?</p>
      </div>
      <button onClick={() => onMerge(similar[0])} style={{ padding: "8px 18px", borderRadius: 10, background: "#2563eb", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
        Join Fight
      </button>
    </div>
  );
}

// ── Status Timeline Dots ─────────────────────────────────────────────────────
function StatusDots({ post }) {
  const steps = [
    { label: "Reported", done: true, color: "#22c55e" },
    { label: "Sent",     done: !!(post.formal_request), color: "#2563eb" },
    { label: "Responded",done: post.status === "responded" || post.status === "resolved", color: "#f59e0b" },
    { label: "Resolved", done: post.status === "resolved", color: "#22c55e" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.done ? s.color : "var(--border)", transition: "background 0.2s" }} title={s.label} />
          {i < steps.length - 1 && <div style={{ width: 12, height: 1, background: "var(--border)" }} />}
        </div>
      ))}
      <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 4 }}>
        {steps.filter(s => s.done).length === 4 ? "Resolved" : steps[steps.findLastIndex(s => s.done)]?.label || "Reported"}
      </span>
    </div>
  );
}

// ── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, index, echoedIds, onEcho, onShare, onOpenModal, viewerLang, translations, translatingIds, onTranslate }) {
  const c = ISSUE_COLORS[post.issue_type || post.issueType] || ISSUE_COLORS.other;
  const name = post.author_name || post.name || "Anonymous Resident";
  const isEchoed = echoedIds.has(String(post.id));
  const isDemo = String(post.id).startsWith("demo");
  const [echoCount, setEchoCount] = useState(post.echo_count ?? post.support ?? 0);
  const [echoScale, setEchoScale] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [priorityVoted, setPriorityVoted] = useState(false);
  const [priorityCount, setPriorityCount] = useState(post.priority_votes || 0);
  const urgency = post.urgency_score || 0;
  const [showCardConsent, setShowCardConsent] = useState(false);

  // Load liked state from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setLiked(saved.includes(String(post.id)));
    const savedPriority = JSON.parse(localStorage.getItem("priorityVotes") || "[]");
    setPriorityVoted(savedPriority.includes(String(post.id)));
  }, [post.id]);

  function handleLike(e) {
    e.stopPropagation();
    setLiked(prev => {
      const next = !prev;
      setLikeCount(c => next ? c + 1 : c - 1);
      const saved = JSON.parse(localStorage.getItem("likedPosts") || "[]");
      const updated = next ? [...saved, String(post.id)] : saved.filter(id => id !== String(post.id));
      localStorage.setItem("likedPosts", JSON.stringify(updated));
      return next;
    });
  }

  function handlePriorityVote(e) {
    e.stopPropagation();
    if (priorityVoted) return;
    setPriorityVoted(true);
    setPriorityCount(n => n + 1);
    const saved = JSON.parse(localStorage.getItem("priorityVotes") || "[]");
    localStorage.setItem("priorityVotes", JSON.stringify([...saved, String(post.id)]));
  }

  async function handleEcho(e) {
    e.stopPropagation();
    if (isEchoed) return;
    const consentKey = `civilian_consent_${post.id}`;
    const alreadyConsented = localStorage.getItem(consentKey) === "true";
    if (!alreadyConsented) { setShowCardConsent(true); return; }
    await doCardEcho();
  }

  async function doCardEcho() {
    const saved = JSON.parse(localStorage.getItem("echoed_posts") || "[]");
    if (saved.includes(String(post.id))) { onEcho(String(post.id)); return; }
    if (typeof window !== "undefined") {
      import("canvas-confetti").then(m => {
        m.default({ particleCount: 40, spread: 60, colors: ["#2563eb","#7c3aed"], origin: { y: 0.9 } });
      }).catch(() => {});
    }
    setEchoScale(1.2);
    setTimeout(() => setEchoScale(1), 200);
    setEchoCount(n => n + 1);
    onEcho(String(post.id));
    localStorage.setItem(`civilian_consent_${post.id}`, "true");
    localStorage.setItem("echoed_posts", JSON.stringify([...saved, String(post.id)]));
    if (!isDemo) {
      try { await fetch("/api/echo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, alreadyEchoed: false }) }); } catch {}
    }
  }

  // 30-day stale badge
  const isStale = post.created_at && !post.status?.includes("resolved") &&
    (Date.now() - new Date(post.created_at).getTime()) > 30 * 24 * 60 * 60 * 1000;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenModal(post)}
      style={{ background: "var(--surface)", border: `1px solid ${hovered ? c.border : "var(--border)"}`, borderRadius: 14, marginBottom: 10, overflow: "hidden", boxShadow: hovered ? `0 4px 20px ${c.border}33` : "var(--card-shadow)", transition: "all 0.2s", cursor: "pointer" }}
    >
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: getAvatarColor(name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
            {getInitials(name)}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{name}</span>
            {(post.author_role || post.role) && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{post.author_role || post.role}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {urgency >= 8 && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>URGENT</span>}
            {isStale && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>30 days no action</span>}
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{timeAgo(index)}</span>
          </div>
        </div>

        <span className="post-type" style={{ background: `${c.border}22`, color: c.border }}>{c.label}</span>
        {/* Moderation fairness badge — shown when post is in a non-English language */}
        {(() => {
          const rawText = post.complaint || post.text || "";
          const postLang = (post.language && post.language !== "en")
            ? post.language
            : detectLang(rawText);
          if (!postLang || postLang === "en") return null;
          return (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)", marginLeft: 6 }}>
              ✓ Reviewed in {LANG_NAMES[postLang] || postLang}
            </span>
          );
        })()}

        <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: "var(--text)", margin: "10px 0 14px" }}>
          {post.complaint || post.text}
        </p>

        {/* Translation banner */}
        {(() => {
          const rawText = post.complaint || post.text || "";
          // post.language field takes priority; detectLang as fallback for DB posts
          const postLang = (post.language && post.language !== "en")
            ? post.language
            : detectLang(rawText);
          if (!postLang || postLang === viewerLang) return null;
          if (translations[post.id]) return (
            <div style={{ marginBottom: 10, padding: "10px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                <span>Translated from {LANG_NAMES[postLang] || postLang}</span>
                <button onClick={e => { e.stopPropagation(); onTranslate(post.id, null, null); }}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 11, padding: 0, fontFamily: "inherit" }}>
                  Show original
                </button>
              </div>
              {translations[post.id]}
            </div>
          );
          return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", marginBottom: 10, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 8, fontSize: 12 }}>
              <span style={{ color: "var(--muted)" }}>Post in {LANG_NAMES[postLang] || postLang} · Translate to {LANG_NAMES[viewerLang] || viewerLang}?</span>
              <button onClick={e => { e.stopPropagation(); onTranslate(post.id, post.complaint || post.text, viewerLang); }}
                disabled={translatingIds.has(post.id)}
                style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontFamily: "inherit", opacity: translatingIds.has(post.id) ? 0.6 : 1 }}>
                {translatingIds.has(post.id) ? "Translating..." : "Translate"}
              </button>
            </div>
          );
        })()}

        <StatusDots post={post} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, marginTop: 8, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Priority vote */}
            <button suppressHydrationWarning onClick={handlePriorityVote} title={priorityVoted ? "You marked this as priority" : "Mark as community priority"} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "none", cursor: priorityVoted ? "default" : "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s", background: priorityVoted ? "rgba(245,158,11,0.12)" : "transparent", color: priorityVoted ? "#f59e0b" : "var(--muted)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={priorityVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span suppressHydrationWarning>{priorityCount}</span>
            </button>
            {/* Echo */}
            <button suppressHydrationWarning onClick={handleEcho} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "none", cursor: isEchoed ? "default" : "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s", background: isEchoed ? "rgba(37,99,235,0.12)" : "transparent", color: isEchoed ? "#2563eb" : "var(--muted)", transform: `scale(${echoScale})` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={isEchoed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
              <span suppressHydrationWarning>{echoCount}</span>
            </button>
            {/* Like */}
            <button suppressHydrationWarning onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s", background: liked ? "rgba(239,68,68,0.1)" : "transparent", color: liked ? "#ef4444" : "var(--muted)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span suppressHydrationWarning>{likeCount}</span>
            </button>
            {/* Comments */}
            <button onClick={e => { e.stopPropagation(); onOpenModal(post); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "var(--muted)", background: "transparent" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Comments
            </button>
            {/* Share */}
            <div style={{ position: "relative" }}>
              <button onClick={e => { e.stopPropagation(); setShowShare(v => !v); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "var(--muted)", background: "transparent" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share
              </button>
              {showShare && <ShareMenu postId={post.id} onClose={() => setShowShare(false)} onCopied={() => onShare()} />}
            </div>
          </div>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{post.location || "Tempe, AZ"}</span>
        </div>
      </div>
      {showCardConsent && (
        <EchoConsentDialog
          post={post}
          onConfirm={(e) => { if (e) e.stopPropagation(); setShowCardConsent(false); doCardEcho(); }}
          onCancel={(e) => { if (e) e.stopPropagation(); setShowCardConsent(false); }}
        />
      )}
    </div>
  );
}

// ── Forum Page ───────────────────────────────────────────────────────────────
export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("new");
  const [search, setSearch] = useState("");
  const [echoedIds, setEchoedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [modalPost, setModalPost] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Translation
  const [viewerLang, setViewerLang] = useState("en");
  const [translations, setTranslations] = useState({});
  const [translatingIds, setTranslatingIds] = useState(new Set());

  useEffect(() => {
    // One-time migration: older builds used "echoedPosts"; canonical key is "echoed_posts" (matches post detail + profile).
    try {
      const legacy = JSON.parse(localStorage.getItem("echoedPosts") || "[]");
      const primary = JSON.parse(localStorage.getItem("echoed_posts") || "[]");
      const leg = Array.isArray(legacy) ? legacy : [];
      const pri = Array.isArray(primary) ? primary : [];
      if (leg.length) {
        const merged = [...new Set([...pri, ...leg].map(String))];
        localStorage.setItem("echoed_posts", JSON.stringify(merged));
        localStorage.removeItem("echoedPosts");
        setEchoedIds(new Set(merged));
      } else {
        setEchoedIds(new Set(pri.map(String)));
      }
    } catch {
      setEchoedIds(new Set());
    }
    setMounted(true);
    function loadFeed() {
      fetch("/api/posts?sort=new")
        .then(r => r.json())
        .then(d => {
          setPosts(Array.isArray(d) ? d : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    loadFeed();
    const poll = setInterval(loadFeed, 30000);
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Browser language fallback
    const browserLang = navigator.language?.split("-")[0] || "en";
    setViewerLang(browserLang);

    // Silently try geolocation — no prompt, no banner
    // Only fires if user already granted location in browser settings
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
            // Try Mapbox first
            if (token) {
              const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=country`);
              const data = await res.json();
              const country = data.features?.[0]?.properties?.short_code;
              if (country && COUNTRY_LANG_MAP[country]) { setViewerLang(COUNTRY_LANG_MAP[country]); return; }
            }
            // Fallback: free reverse geocode via nominatim
            const res2 = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data2 = await res2.json();
            const cc = data2?.address?.country_code?.toLowerCase();
            if (cc && COUNTRY_LANG_MAP[cc]) {
              setViewerLang(COUNTRY_LANG_MAP[cc]);
            }
          } catch {}
        },
        () => {} // denied or unavailable — keep browser language, no UI shown
      );
    }

    return () => {
      clearInterval(poll);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  async function translatePost(postId, text, targetLang) {
    // "Show original" — clear translation
    if (text === null) {
      setTranslations(prev => { const next = { ...prev }; delete next[postId]; return next; });
      return;
    }
    setTranslatingIds(prev => new Set([...prev, postId]));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: targetLang, targetLanguageName: LANG_NAMES[targetLang] || targetLang }),
      });
      const data = await res.json();
      if (data.translated) setTranslations(prev => ({ ...prev, [postId]: data.translated }));
    } catch {}
    finally {
      setTranslatingIds(prev => { const next = new Set(prev); next.delete(postId); return next; });
    }
  }

  function handleEcho(id) {
    setEchoedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("echoed_posts", JSON.stringify([...next]));
      return next;
    });
    setToast({ message: "Voice added!", type: "success" });
  }

  const staticPosts = FORUM_THREADS.map(t => ({ ...t, issue_type: t.issueType || t.issue_type, complaint: t.text || t.complaint, echo_count: t.support || t.echo_count || 0 }));
  // Spanish post always pinned to index 0 — immune to sort order and DB state
  const spanishPost = staticPosts.find(p => p.language === "es");
  const restStatic = staticPosts.filter(p => p.language !== "es");
  const dbPosts = posts.filter(p => p.language !== "es"); // prevent DB duplicate if seeded
  const allPosts = [...(spanishPost ? [spanishPost] : []), ...dbPosts, ...restStatic];

  const filtered = (() => {
    const base = allPosts.filter(p => {
      const matchFilter = filter === "all" || (p.issue_type || p.issueType) === filter;
      const matchSearch = !search || (p.complaint || p.text || "").toLowerCase().includes(search.toLowerCase()) || (p.location || "").toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
    // Spanish post always stays at index 0 if it passes the filter
    const spanish = base.filter(p => p.language === "es");
    const rest = base.filter(p => p.language !== "es").sort((a, b) => {
      if (sort === "trending") return (b.echo_count || 0) - (a.echo_count || 0);
      if (sort === "urgent") return (b.urgency_score || 0) - (a.urgency_score || 0);
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
    return [...spanish, ...rest];
  })();

  const trending = [...allPosts].sort((a, b) => (b.echo_count || 0) - (a.echo_count || 0)).slice(0, 5);

  // Neighborhood health score
  const unresolvedCount = allPosts.filter(p => p.status !== "resolved").length;
  const healthScore = Math.max(0, Math.min(100, 100 - unresolvedCount * 2));
  const healthColor = healthScore >= 80 ? "#22c55e" : healthScore >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* Offline banner */}
      {!isOnline && (
        <div style={{ background: "#f59e0b", padding: "8px 24px", fontSize: 13, fontWeight: 600, color: "white", textAlign: "center" }}>
          You&apos;re offline — changes will sync when reconnected
        </div>
      )}

      <div className="forum-layout" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 32 }}>
        <aside className="forum-left-aside" style={{ width: 200, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Filter</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{ width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.15s", background: filter === f.key ? "#2563eb" : "transparent", color: filter === f.key ? "white" : "var(--muted)" }}>{f.label}</button>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link href="/compose" className="nav-btn" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>+ Raise Issue</Link>
            </div>
            {/* Health score */}
            <div style={{ marginTop: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 8 }}>Neighborhood Health</p>
              <p suppressHydrationWarning style={{ fontSize: 28, fontWeight: 800, color: healthColor, letterSpacing: -1 }}>{mounted ? healthScore : ""}</p>
              <div style={{ height: 4, background: "var(--border)", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
                <div suppressHydrationWarning style={{ height: "100%", width: `${mounted ? healthScore : 0}%`, background: healthColor, borderRadius: 999, transition: "width 1s" }} />
              </div>
              <p suppressHydrationWarning style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{mounted ? `${unresolvedCount} unresolved issues` : ""}</p>
            </div>
          </div>
        </aside>

      <main role="main" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: "var(--text)", marginBottom: 12 }}>Community Feed</h1>
            {/* Search */}
            <input type="text" placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 8 }} />
            {/* Sort tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {[["new","New"],["trending","Trending"],["urgent","Urgent"]].map(([key, label]) => (
                <button key={key} onClick={() => setSort(key)} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${sort === key ? "#2563eb" : "var(--border)"}`, background: sort === key ? "#2563eb" : "transparent", color: sort === key ? "white" : "var(--muted)", fontFamily: "inherit", transition: "all 0.15s" }}>{label}</button>
              ))}
            </div>
            <p suppressHydrationWarning style={{ fontSize: 14, color: "var(--muted)" }}>{mounted ? filtered.length : 0} issues</p>
          </div>

          {/* Similarity banner — shown when filter is active */}
          {filter !== "all" && (
            <SimilarityBanner posts={allPosts} newIssueType={filter} newLocation="Tempe" onMerge={p => setModalPost(p)} />
          )}

          {loading && <div className="loading-wrap"><div className="loading-spinner" /><p className="loading-text">Loading...</p></div>}
          {!loading && filtered.length === 0 && <div className="empty-state"><p className="empty-title">No issues found</p></div>}
          {!loading && filtered.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} echoedIds={echoedIds} onEcho={handleEcho}
              onShare={() => setToast({ message: "Link copied!", type: "success" })}
              onOpenModal={setModalPost}
              viewerLang={viewerLang}
              translations={translations}
              translatingIds={translatingIds}
              onTranslate={translatePost} />
          ))}
        </main>

        <aside className="forum-right-aside" style={{ width: 256, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "var(--card-shadow)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Trending Issues</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {trending.map((t, i) => {
                  const c = ISSUE_COLORS[t.issue_type || t.issueType] || ISSUE_COLORS.other;
                  return (
                    <div key={t.id || i} onClick={() => setModalPost(t)} style={{ display: "flex", gap: 8, cursor: "pointer" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginTop: 2, minWidth: 14 }}>{i + 1}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.complaint || t.text}</p>
                        <span style={{ fontSize: 10, fontWeight: 600, color: c.border }}>{t.echo_count || t.support} voices</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, boxShadow: "var(--card-shadow)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Recently Resolved</p>
              {[["Shade structures at Kiwanis Park","3 days ago",48],["Pothole on Apache Blvd","1 week ago",56],["Crosswalk lighting on Mill Ave","2 weeks ago",34]].map(([title,time,voices],i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{title}</p>
                  <p style={{ fontSize: 10, color: "var(--muted)" }}>Resolved {time} · {voices} voices</p>
                </div>
              ))}
            </div>

          </div>
        </aside>
      </div>

      {modalPost && (
        <PostModal post={modalPost} echoedIds={echoedIds} onEcho={handleEcho}
          onClose={() => setModalPost(null)} onToast={setToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

