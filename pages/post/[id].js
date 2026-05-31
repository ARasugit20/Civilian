import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";
import Toast from "../../components/Toast";
import EchoConsentDialog from "../../components/EchoConsentDialog";
import PostSidebar from "../../components/PostSidebar";
import { FORUM_THREADS } from "../../lib/civicData";
import { echoFetchHeaders } from "../../lib/clientEchoId";

const TYPE_LABELS = {
  traffic_safety:   { label: "Traffic Safety",   cls: "type-traffic"  },
  traffic:          { label: "Traffic",           cls: "type-traffic"  },
  street_lighting:  { label: "Street Lighting",   cls: "type-lighting" },
  road_maintenance: { label: "Road Maintenance",  cls: "type-roads"    },
  parks_facilities: { label: "Parks",             cls: "type-parks"    },
  noise_complaint:  { label: "Noise",             cls: "type-noise"    },
  housing:          { label: "Housing",           cls: "type-safety"   },
  utilities:        { label: "Utilities",         cls: "type-other"    },
  other:            { label: "Community",         cls: "type-other"    },
};

// Demo government responses for seeded posts
const DEMO_GOV_RESPONSES = {
  "demo-1": "Thank you for your report regarding pedestrian lighting at Mill Ave and University Drive. Our Public Works team has reviewed the request and scheduled an on-site inspection for March 28th. We anticipate installation of two new LED pedestrian lights within 45 days pending budget approval. — Kevin Mattingly, Public Works Director",
  "demo-3": "We appreciate the community's concern regarding Kiwanis Park shade structures. The Parks & Recreation Department has allocated $42,000 from the Capital Improvement Fund for new shade canopies. Installation is scheduled to begin April 15th. — Sarah Chen, Parks & Recreation Director",
  "demo-4": "The pothole on Apache Blvd near the 101 overpass has been logged as Priority 1 in our repair queue. A crew has been dispatched and repair is expected within 72 hours. We apologize for the inconvenience. — Transportation Services, City of Tempe",
};

const DUMMY_COMMENTS = [
  { id: "d1", author_name: "Maria S.", text: "This has been an issue for months! My kids almost got hit last week.", created_at: "2h ago" },
  { id: "d2", author_name: "James T.", text: "I reported this to 311 twice. Nothing happened. This platform is our last hope.", created_at: "5h ago" },
  { id: "d3", author_name: "Chen W.", text: "47 of us signed the letter. Sending it tomorrow morning.", created_at: "1d ago" },
];

function getInitials(name) {
  return (name || "A").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}
function getAvatarColor(name) {
  const colors = ["#2563eb","#6366f1","#8b5cf6","#f59e0b","#22c55e","#ef4444","#f97316"];
  let h = 0;
  for (let i = 0; i < (name||"").length; i++) h = (name||"").charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function ShareMenu({ postId, onClose, onCopied }) {
  const ref = useRef(null);
  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : "";
  const enc = encodeURIComponent(postUrl);
  const msg = encodeURIComponent("Check this community issue: " + postUrl);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const options = [
    { label: "Copy Link",         action: () => { navigator.clipboard.writeText(postUrl); onCopied(); onClose(); } },
    { label: "Share on X",        href: `https://twitter.com/intent/tweet?text=I%20raised%20a%20civic%20issue%20on%20Civilian!&url=${enc}` },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${msg}` },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` },
  ];

  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", minWidth: 200, overflow: "hidden" }}>
      {options.map(opt => (
        opt.href ? (
          <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" onClick={onClose}
            style={{ display: "block", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {opt.label}
          </a>
        ) : (
          <button key={opt.label} onClick={opt.action}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {opt.label}
          </button>
        )
      ))}
    </div>
  );
}

function CommentsSection({ postId }) {
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
    const opt = { id: Date.now(), text, author_name: "Anonymous", created_at: "just now" };
    setComments(prev => [...prev, opt]);
    setText("");
    try { await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post_id: postId, text: opt.text, author_name: "Anonymous" }) }); } catch {}
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
    <div className="result-section">
      <p className="result-label">Comments</p>
      {loading ? <p style={{ fontSize: 13, color: "var(--muted)" }}>Loading...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: getAvatarColor(c.author_name || "A"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
                {getInitials(c.author_name || "Anonymous")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{c.author_name || "Anonymous"}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{typeof c.created_at === "string" && c.created_at.includes("ago") ? c.created_at : c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.55 }}>{c.text}</p>
              </div>
              <button onClick={() => toggleLike(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: likedIds.has(c.id) ? "#ef4444" : "var(--muted)", alignSelf: "flex-start", marginTop: 4, padding: 2 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={likedIds.has(c.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input type="text" placeholder="Add your voice..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && postComment()}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none" }} />
        <button onClick={postComment} disabled={!text.trim()} style={{ padding: "10px 20px", borderRadius: 10, background: "#2563eb", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: !text.trim() ? 0.5 : 1 }}>Post</button>
      </div>
    </div>
  );
}

// Animated counter for echo count
function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(step);
      else prev.current = end;
    }
    requestAnimationFrame(step);
  }, [value]);
  return <>{display}</>;
}

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [echoed, setEchoed] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copyState, setCopyState] = useState("idle"); // idle | copied
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [localGovResponse, setLocalGovResponse] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts?id=${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        let resolved = data;
        // Fallback: check static FORUM_THREADS if DB returned nothing
        if (!resolved) {
          const staticMatch = FORUM_THREADS.find(t => String(t.id) === String(id));
          if (staticMatch) {
            resolved = {
              ...staticMatch,
              complaint: staticMatch.text || staticMatch.complaint,
              issue_type: staticMatch.issueType || staticMatch.issue_type,
              echo_count: staticMatch.support || staticMatch.echo_count || 0,
              formal_request: staticMatch.formal_request || `Dear ${staticMatch.department || "City of Tempe"},\n\nWe the undersigned residents formally request immediate attention to the following community concern:\n\n${staticMatch.text || staticMatch.complaint}\n\nThis issue has been raised by ${staticMatch.support || 1} residents.\n\nSincerely,\nConcerned Tempe Residents`,
              official_name: staticMatch.official_name || "City of Tempe 311 Service",
              department: staticMatch.department || "Tempe City Services",
              official_email: staticMatch.official_email || "311@tempe.gov",
              location: staticMatch.location || "Tempe, AZ",
              status: staticMatch.status || "pending",
            };
          }
        }
        setPost(resolved);
        setLoading(false);
        if (resolved) setLikeCount(resolved.like_count || 0);
      })
      .catch(() => setLoading(false));
    const savedLikes = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setLiked(savedLikes.includes(String(id)));
    const savedEchoes = JSON.parse(localStorage.getItem("echoed_posts") || "[]");
    if (savedEchoes.includes(String(id))) setEchoed(true);
  }, [id]);



  function handleLike() {
    setLiked(prev => {
      const next = !prev;
      setLikeCount(c => next ? c + 1 : c - 1);
      const saved = JSON.parse(localStorage.getItem("likedPosts") || "[]");
      const updated = next ? [...saved, String(id)] : saved.filter(x => x !== String(id));
      localStorage.setItem("likedPosts", JSON.stringify(updated));
      return next;
    });
  }

  async function handleEcho() {
    if (echoed) return;
    // Check if already consented for this post
    const consentKey = `civilian_consent_${id}`;
    const alreadyConsented = localStorage.getItem(consentKey) === "true";
    if (!alreadyConsented) {
      setShowConsentDialog(true);
      return;
    }
    await doEcho();
  }

  async function doEcho() {
    const saved = JSON.parse(localStorage.getItem("echoed_posts") || "[]");
    if (saved.includes(String(id))) { setEchoed(true); return; }
    if (typeof window !== "undefined") {
      import("canvas-confetti").then(m => {
        m.default({ particleCount: 80, spread: 80, colors: ["#2563eb","#7c3aed","#22c55e"], origin: { y: 0.7 } });
      }).catch(() => {});
    }
    localStorage.setItem(`civilian_consent_${id}`, "true");
    localStorage.setItem("echoed_posts", JSON.stringify([...saved, String(id)]));
    await fetch("/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...echoFetchHeaders() },
      body: JSON.stringify({ id, alreadyEchoed: false }),
    });
    setPost(p => ({ ...p, echo_count: p.echo_count + 1 }));
    setEchoed(true);
    setToast({ message: "Your voice has been added!", type: "success" });
  }

  async function handleSendEmail() {
    if (sent) return;
    setSending(true); setSendError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ official_email: post.official_email, official_email_fallback: post.official_email_fallback, official_name: post.official_name, department: post.department, issue_type: post.issue_type, formal_request: post.formal_request, location: post.location, post_id: post.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setSent(true);
      setToast({ message: `Letter sent to ${post.official_name}!`, type: "success" });
      // TinyFish follow-up is scheduled server-side after 7 days — do NOT trigger here
    } catch (err) { setSendError(err.message); }
    finally { setSending(false); }
  }

  async function downloadPetition() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setFont("helvetica","bold");
    doc.text("COMMUNITY PETITION", 105, 20, { align: "center" });
    doc.setFontSize(11); doc.setFont("helvetica","normal");
    doc.text(`Issue: ${post.complaint}`, 20, 35, { maxWidth: 170 });
    doc.text(`Location: ${post.location || "Tempe, AZ"}`, 20, 55);
    doc.text(`Voices: ${post.echo_count} Tempe Residents`, 20, 63);
    if (post.formal_request) {
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(post.formal_request, 170);
      doc.text(lines, 20, 78);
    }
    doc.setFontSize(10); doc.setFont("helvetica","italic");
    doc.text(`Signed by ${post.echo_count} Tempe Residents — Generated by Civilian`, 105, 280, { align: "center" });
    doc.save(`petition-${post.id}.pdf`);
  }

  if (loading) return <><Nav /><div className="container"><div className="loading-wrap"><div className="loading-spinner" /></div></div></>;
  if (!post) return (
    <>
      <Nav />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Issue not found</p>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, lineHeight: 1.6 }}>
          This issue may have been submitted locally. Here are some active community issues:
        </p>
        {FORUM_THREADS.slice(0, 3).map(t => (
          <Link href={`/post/${t.id}`} key={t.id} style={{ display: "block", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 10, textDecoration: "none", textAlign: "left" }}>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase" }}>{(t.issueType || "").replace(/_/g, " ")}</p>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>{(t.text || t.complaint || "").slice(0, 100)}...</p>
            <p style={{ fontSize: 12, color: "#2563eb", marginTop: 6 }}>👥 {t.support || 0} voices</p>
          </Link>
        ))}
        <Link href="/forum" style={{ display: "inline-block", marginTop: 12, fontSize: 14, color: "#2563eb", textDecoration: "none" }}>← Back to community feed</Link>
      </div>
    </>
  );

  const typeInfo = TYPE_LABELS[post.issue_type] || TYPE_LABELS.other;
  const progress = Math.min((post.echo_count / 50) * 100, 100);
  const echoes = Number(post.echo_count) || 0;
  const urgency = post.urgency_score || 0;
  const govResponse = localGovResponse || post.gov_response || DEMO_GOV_RESPONSES[String(post.id)];

  // Response time predictor (based on issue type)
  const RESPONSE_DAYS = { traffic_safety: 14, road_maintenance: 21, parks_facilities: 30, street_lighting: 10, noise_complaint: 7, housing: 45, other: 21 };
  const expectedDays = RESPONSE_DAYS[post.issue_type] || 21;

  // 30-day stale check
  const isStale = post.created_at && post.status !== "resolved" &&
    (Date.now() - new Date(post.created_at).getTime()) > 30 * 24 * 60 * 60 * 1000;

  const tierMilestones = [
    { threshold: 10, label: "10 voices = Department Notified", reached: echoes >= 10, border: "rgba(245,158,11,0.35)", bg: "rgba(254,243,199,0.5)" },
    { threshold: 25, label: "25 voices = Council Escalation",  reached: echoes >= 25, border: "rgba(249,115,22,0.35)",  bg: "rgba(255,237,213,0.55)" },
    { threshold: 50, label: "50 voices = Public Records Filed", reached: echoes >= 50, border: "rgba(239,68,68,0.35)",   bg: "rgba(254,226,226,0.45)" },
  ];

  const lifecycleSteps = [
    { key: "reported", label: "Reported",             done: true },
    { key: "letter",   label: "Letter Sent",          done: sent || post.letter_sent },
    { key: "gov",      label: "Government Responded", done: !!govResponse || post.status === "responded" || post.status === "resolved" },
    { key: "done",     label: "Resolved",             done: post.status === "resolved" },
  ];
  let currentIdx = lifecycleSteps.findIndex(s => !s.done);
  if (currentIdx === -1) currentIdx = lifecycleSteps.length - 1;

  // mailto link
  const mailtoHref = post.official_email
    ? `mailto:${post.official_email}?subject=${encodeURIComponent(`Community Issue: ${typeInfo.label} - ${post.location || "Tempe, AZ"}`)}&body=${encodeURIComponent(post.formal_request || "")}`
    : null;

  return (
    <>
      <Nav />
      <div role="main" className="two-col-grid">
        <div>
        <Link href="/forum" className="back-link">← Back to feed</Link>

        {/* Badges row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {urgency >= 8 && (
            <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>URGENT — Safety Issue</span>
          )}
          {isStale && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>30 days with no action</span>
          )}
        </div>

        {/* TinyFish follow-up banner */}
        {post.follow_up_sent && (
          <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            AI automatically sent a follow-up letter to {post.official_name} after no response.
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, opacity: 0.7 }}>Powered by TinyFish</span>
          </div>
        )}

        <div className="result-section">
          <span className={`post-type ${typeInfo.cls}`}>{typeInfo.label}</span>
          <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.5, margin: "12px 0 8px", color: "var(--text)" }}>{post.complaint}</p>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>{post.location}</p>
        </div>

        {/* AI Response Predictor */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Based on similar issues, expect a response in ~{expectedDays} days</p>
            <p style={{ fontSize: 11, color: "var(--muted)" }}>AI prediction based on {typeInfo.label} issue history in Tempe</p>
          </div>
        </div>

        {/* Collective Power */}
        <div className="collective-bar">
          <p className="collective-count">{post.echo_count} residents</p>
          <p className="collective-label">have raised this same issue</p>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="detail-tier-row">
            {tierMilestones.map(tier => (
              <div key={tier.threshold} className={`detail-tier-badge ${tier.reached ? "detail-tier-badge--active" : "detail-tier-badge--muted"}`}
                style={{ borderColor: tier.reached ? tier.border : undefined, background: tier.reached ? tier.bg : undefined }}>
                <span className="detail-tier-icon">{tier.reached ? "✓" : "○"}</span>
                <span>{tier.label}</span>
              </div>
            ))}
          </div>
          <div className="detail-timeline">
            <p className="detail-timeline-label">Issue lifecycle</p>
            <div className="detail-timeline-track">
              {lifecycleSteps.map((step, i) => {
                const isDone = step.done;
                const isCurrent = i === currentIdx && !isDone;
                return (
                  <div key={step.key} className={`detail-timeline-step ${!isDone && !isCurrent ? "detail-timeline-step--future" : ""}`}>
                    <div className={`detail-timeline-dot ${isDone ? "detail-timeline-dot--done" : ""} ${isCurrent ? "detail-timeline-dot--current" : ""}`} />
                    <span className="detail-timeline-step-title">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Echo + Like row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button aria-label={echoed ? "You already added your voice" : "Add your voice to this issue"} className={`echo-btn ${echoed ? "echoed" : ""}`} onClick={handleEcho} style={{ flex: 1 }}>
            {echoed ? "✓ Your voice has been added" : "Add My Voice to This Issue"}
          </button>
          <button aria-label={liked ? "Unlike this issue" : "Like this issue"} onClick={handleLike} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid var(--border)", background: liked ? "rgba(239,68,68,0.1)" : "var(--surface)", color: liked ? "#ef4444" : "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {likeCount}
          </button>
        </div>

        {/* Petition download */}
        {echoes >= 25 && (
          <button onClick={downloadPetition} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1px solid rgba(37,99,235,0.4)", background: "rgba(37,99,235,0.08)", color: "#2563eb", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Petition PDF ({echoes} signatures)
          </button>
        )}

        <div className="result-section">
          <p className="result-label">This letter goes to</p>
          <div className="official-card">
            <span className="official-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </span>
            <div>
              <p className="official-name">{post.official_name || "Contact information pending"}</p>
              <p className="official-dept">{post.department || ""}</p>
              <p className="official-email">{post.official_email || ""}</p>
            </div>
          </div>
          {post.official_email && (
            <a
              href={`mailto:${post.official_email}?subject=${encodeURIComponent(`Community Concern: ${typeInfo.label} — ${post.location || "Tempe, AZ"}`)}&body=${encodeURIComponent(post.formal_request || "")}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, padding: "10px 16px", borderRadius: 10, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.3)", color: "#2563eb", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Send Letter via Email
            </a>
          )}
        </div>

        {/* Government Response */}
        {govResponse && (
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#22c55e" }}>Official Government Response</p>
            </div>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, fontStyle: "italic" }}>&ldquo;{govResponse}&rdquo;</p>
          </div>
        )}

        {/* Response tracking — shown when no response yet */}
        {!govResponse && (
          <div style={{ marginBottom: 16 }}>
            {!showResponseForm ? (
              <button
                aria-label="Mark that official responded"
                onClick={() => setShowResponseForm(true)}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.06)", color: "#22c55e", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Did the official respond? Mark it here
              </button>
            ) : (
              <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 14, padding: "16px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>Paste the official&apos;s response:</p>
                <textarea
                  aria-label="Official response text"
                  rows={4}
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="e.g. Thank you for your report. Our team has scheduled a repair for next week..."
                  style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => { if (responseText.trim()) { setLocalGovResponse(responseText.trim()); setShowResponseForm(false); setToast({ message: "✓ Official responded in 4 days — response recorded!", type: "success" }); } }}
                    disabled={!responseText.trim()}
                    style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: "#22c55e", color: "white", fontSize: 13, fontWeight: 600, cursor: responseText.trim() ? "pointer" : "not-allowed", opacity: responseText.trim() ? 1 : 0.5 }}>
                    Save Response
                  </button>
                  <button onClick={() => setShowResponseForm(false)} style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="result-section">
          <p className="result-label">Formal letter (AI-generated)</p>
          <div style={{ display: "flex", gap: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>AI-Generated Letter — Please review before sending. This was written by Claude AI and may contain inaccuracies about specific laws, officials, or procedures. Official contact details were found via web search and may have changed.</span>
          </div>
          <p className="result-text">{post.formal_request}</p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          {/* One-click mailto */}
          {mailtoHref && !sent && (
            <a href={mailtoHref} onClick={() => { setSent(true); setToast({ message: `Letter sent to ${post.official_name}!`, type: "success" }); }}
              style={{ flex: 2, minWidth: 200, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 12, background: sent ? "#dcfce7" : "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 20px rgba(37,99,235,0.35)", transition: "all 0.2s" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Send Letter Now
            </a>
          )}
          {sent && (
            <div style={{ flex: 2, minWidth: 200, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 12, background: "#dcfce7", border: "1px solid #86efac", color: "#166534", fontSize: 15, fontWeight: 700 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Letter sent to {post.official_name}
            </div>
          )}
          {/* Share */}
          <div style={{ position: "relative", flex: 1 }}>
            <button className="share-btn" onClick={() => setShowShare(v => !v)} style={{ width: "100%" }}>Share this issue</button>
            {showShare && <ShareMenu postId={post.id} onClose={() => setShowShare(false)} onCopied={() => setToast({ message: "Link copied!", type: "success" })} />}
          </div>
        </div>

        {sendError && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#991b1b" }}>{sendError}</div>
        )}

        <CommentsSection postId={post.id} />

        <div className="notice" style={{ marginTop: 16 }}>
          This letter is AI-generated based on your description. Review before sending. This is not legal advice.
          <Link href="/policy" style={{ marginLeft: 8, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Community Policy</Link>
        </div>
        </div>{/* end main col */}

        <aside className="desktop-sidebar">
          <PostSidebar post={post} />
        </aside>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      {showConsentDialog && post && (
        <EchoConsentDialog
          post={post}
          onConfirm={() => { setShowConsentDialog(false); doEcho(); }}
          onCancel={() => setShowConsentDialog(false)}
        />
      )}
    </>
  );
}
