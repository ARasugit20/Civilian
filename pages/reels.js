import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import Toast from "../components/Toast";
import { ISSUE_COLORS } from "../lib/civicData";
import { echoFetchHeaders } from "../lib/clientEchoId";

const ISSUE_IMAGES = {
  traffic_safety:   "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
  traffic:          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
  parks_facilities: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  road_maintenance: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
  street_lighting:  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
  noise_complaint:  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
  default:          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
};

const DEMO_REELS = [
  { id: "demo-1", complaint: "The crosswalk at Mill Ave and University has no lighting. Near-misses every morning during school drop-off.", location: "Mill Ave & University Dr, Tempe", issue_type: "traffic_safety", echo_count: 47, author_name: "Maria Santos", author_role: "Parent", image_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
  { id: "demo-2", complaint: "Kiwanis Park playground equipment is broken and the shade structures are torn. Kids can't play safely in summer heat.", location: "Kiwanis Park, Tempe", issue_type: "parks_facilities", echo_count: 34, author_name: "James Thompson", author_role: "Homeowner", image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800" },
  { id: "demo-3", complaint: "Community meeting on Apache Blvd rezoning was cancelled with no notice. Residents deserve transparency.", location: "Apache Blvd, Tempe", issue_type: "other", echo_count: 28, author_name: "Aisha Johnson", author_role: "Teacher", image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800" },
  { id: "demo-4", complaint: "Noise from the construction on Southern Ave starts at 5am every day. Violates city ordinance 9-10.", location: "Southern Ave, Tempe", issue_type: "noise_complaint", echo_count: 19, author_name: "Chen Wei", author_role: "Graduate Student", image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800" },
];

function ShareMenu({ postId, demoUrl, onClose, onCopied }) {
  const ref = useRef(null);
  const postUrl = demoUrl || (typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : "");
  const enc = encodeURIComponent(postUrl);
  const msg = encodeURIComponent("Check this community issue: " + postUrl);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const options = [
    { label: "Copy Link",         action: () => { navigator.clipboard.writeText(postUrl); onCopied(); onClose(); } },
    { label: "Share on X",        href: `https://twitter.com/intent/tweet?text=Civic%20issue%20on%20Civilian&url=${enc}` },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${msg}` },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
  ];

  return (
    <div ref={ref} style={{ position: "absolute", bottom: "calc(100% + 8px)", right: 0, zIndex: 200, background: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 180, overflow: "hidden" }}>
      {options.map(opt => (
        opt.href ? (
          <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" onClick={onClose}
            style={{ display: "block", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "white", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {opt.label}
          </a>
        ) : (
          <button key={opt.label} onClick={opt.action}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "white", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {opt.label}
          </button>
        )
      ))}
    </div>
  );
}

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [echoed, setEchoed] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [shareReelId, setShareReelId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch("/api/posts")
      .then(r => r.json())
      .then(d => { setReels([...DEMO_REELS, ...(Array.isArray(d) ? d : [])]); setLoading(false); })
      .catch(() => { setReels(DEMO_REELS); setLoading(false); });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const idx = Math.round(container.scrollTop / container.clientHeight);
      if (idx !== currentIndex && idx >= 0 && idx < reels.length) setCurrentIndex(idx);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex, reels.length]);

  async function handleEcho(reelId) {
    if (echoed.has(reelId)) return;
    setEchoed(prev => new Set(prev).add(reelId));
    setReels(prev => prev.map(r => r.id === reelId ? { ...r, echo_count: (r.echo_count || 0) + 1 } : r));
    setToast({ message: "Voice added!", type: "success" });
    if (!String(reelId).startsWith("demo")) {
      try {
        await fetch("/api/echo", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...echoFetchHeaders() },
          body: JSON.stringify({ id: reelId }),
        });
      } catch {}
    }
  }

  function handleShare(reel) {
    const url = `${window.location.origin}/post/${reel.id}`;
    navigator.clipboard.writeText(url).then(() => setToast({ message: "Link copied!", type: "success" }));
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Nav />
        <div className="loading-wrap"><div className="loading-spinner" /><p className="loading-text">Loading reels...</p></div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#000" }}>
      <div style={{ flexShrink: 0 }}><Nav /></div>

      <div ref={containerRef} style={{ flex: 1, overflowY: "auto", scrollSnapType: "y mandatory" }}>
        {reels.map((reel, i) => {
          const c = ISSUE_COLORS[reel.issue_type] || ISSUE_COLORS.other;
          const bgImage = ISSUE_IMAGES[reel.issue_type] || ISSUE_IMAGES.default;
          const isEchoed = echoed.has(reel.id);

          return (
            <div key={reel.id} style={{ height: "100%", width: "100%", position: "relative", scrollSnapAlign: "start", scrollSnapStop: "always", overflow: "hidden" }}>
              {/* Background */}
              {reel.video_url ? (
                <video src={reel.video_url} autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(8px) brightness(0.4)" }} />
              )}

              {/* Gradient */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)", zIndex: 1 }} />

              {/* Issue badge */}
              <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, textTransform: "uppercase", letterSpacing: 0.5, background: `${c.border}33`, color: c.border, border: `1px solid ${c.border}66` }}>
                  {c.label}
                </span>
              </div>

              {/* Progress dots */}
              <div style={{ position: "absolute", top: 24, right: 24, zIndex: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                {reels.slice(0, 8).map((_, di) => (
                  <div key={di} style={{ width: 5, borderRadius: 999, transition: "all 300ms", height: di === currentIndex ? 18 : 5, background: di === currentIndex ? "white" : "rgba(255,255,255,0.3)" }} />
                ))}
              </div>

              {/* Right actions */}
              <div style={{ position: "absolute", right: 20, bottom: 160, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                {/* Echo */}
                <button onClick={() => handleEcho(reel.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, color: "white" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 150ms", background: isEchoed ? "#22c55e" : "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isEchoed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{reel.echo_count || 0}</span>
                </button>

                {/* Comments / View */}
                <button onClick={() => { window.location.href = String(reel.id).startsWith("demo") ? "/forum" : `/post/${reel.id}`; }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, color: "white" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>View</span>
                </button>

                {/* Share */}
                <button onClick={() => setShareReelId(shareReelId === reel.id ? null : reel.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, color: "white", position: "relative" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Share</span>
                  {shareReelId === reel.id && (
                    <ShareMenu
                      postId={String(reel.id).startsWith("demo") ? null : reel.id}
                      demoUrl={String(reel.id).startsWith("demo") ? `${typeof window !== "undefined" ? window.location.origin : ""}/reels` : null}
                      onClose={() => setShareReelId(null)}
                      onCopied={() => setToast({ message: "Link copied!", type: "success" })}
                    />
                  )}
                </button>
              </div>

              {/* Bottom content */}
              <div style={{ position: "absolute", bottom: 32, left: 24, right: 96, zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <img
                    src={`https://i.pravatar.cc/150?img=${(i % 12) + 1}`}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }}
                  />
                  <div>
                    <p style={{ color: "white", fontWeight: 600, fontSize: 14, lineHeight: 1 }}>{reel.author_name || "Anonymous Resident"}</p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{reel.author_role || "Resident"}</p>
                  </div>
                </div>
                <p style={{ color: "white", fontSize: 16, fontWeight: 700, lineHeight: 1.5, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                  {reel.complaint}
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>
                  {reel.location || "Tempe, AZ"}
                </p>
                <Link href="/compose" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 999, background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }}>
                  Add My Voice
                </Link>
              </div>
            </div>
          );
        })}

        {reels.length === 0 && (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No reels yet</p>
              <Link href="/compose" style={{ color: "#60a5fa", textDecoration: "none" }}>Raise the first issue</Link>
            </div>
          </div>
        )}
      </div>

      {/* Upload FAB */}
      <button onClick={() => setShowUpload(true)} style={{
        position: "fixed", bottom: 32, right: 32, zIndex: 50,
        width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
        boxShadow: "0 4px 20px rgba(37,99,235,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Upload modal */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={reel => { setReels(prev => [reel, ...prev]); setShowUpload(false); setToast({ message: "Reel posted!", type: "success" }); }} />}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

function UploadModal({ onClose, onUploaded }) {
  const [complaint, setComplaint] = useState("");
  const [location, setLocation] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!complaint.trim()) return;
    setUploading(true);
    try {
      const body = { complaint, location: location || "Tempe, AZ", issue_type: "other", formal_request: "", department: "", official_name: "", official_email: "", video_url: videoPreview || null };
      const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      onUploaded(data);
    } catch {
      setUploading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Share a Reel</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 24, lineHeight: 1 }}>&times;</button>
        </div>

        <label htmlFor="video-upload" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 24, borderRadius: 12, border: "2px dashed var(--border)", cursor: "pointer", marginBottom: 16, color: "var(--muted)", fontSize: 14 }}>
          {videoPreview ? (
            <video src={videoPreview} style={{ width: "100%", borderRadius: 8, maxHeight: 160, objectFit: "cover" }} muted />
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <span>Select video (optional)</span>
            </>
          )}
        </label>
        <input id="video-upload" type="file" accept="video/*" onChange={handleVideo} style={{ display: "none" }} />

        <div className="form-group">
          <label className="form-label">Describe the issue</label>
          <textarea rows={3} placeholder="What's the problem?" value={complaint} onChange={e => setComplaint(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input type="text" placeholder="e.g. Mill Ave & University Dr" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <button className="submit-btn" onClick={handleUpload} disabled={uploading || !complaint.trim()}>
          {uploading ? "Posting..." : "Upload & Post"}
        </button>
      </div>
    </div>
  );
}
