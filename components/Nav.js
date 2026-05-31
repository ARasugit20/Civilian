import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";

const LINKS = [
  { href: "/forum", label: "Feed" },
  { href: "/map", label: "Map" },
  { href: "/reels", label: "Reels" },
  { href: "/groups", label: "Groups" },
  { href: "/agent", label: "Track" },
];

function formatNotificationTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function NotificationsDropdown({ onClose, notifications, onMarkAllRead }) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 9000, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.25)", width: 360, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
          Notifications
          {unread > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "#ef4444", color: "white", marginLeft: 6 }}>
              {unread}
            </span>
          )}
        </p>
        {unread > 0 && (
          <button type="button" onClick={onMarkAllRead} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Mark all read
          </button>
        )}
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <p style={{ padding: "20px 16px", fontSize: 13, color: "var(--muted)" }}>No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              href={n.post_id ? `/post/${n.post_id}` : "/notifications"}
              onClick={onClose}
              style={{ display: "flex", gap: 10, padding: "12px 16px", textDecoration: "none", borderBottom: "1px solid var(--border)", background: n.read ? "transparent" : "rgba(37,99,235,0.05)" }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "transparent" : "#2563eb", flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{formatNotificationTime(n.created_at)}</p>
              </div>
            </Link>
          ))
        )}
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
        <Link href="/notifications" onClick={onClose} style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
          View all notifications
        </Link>
      </div>
    </div>
  );
}

function ProfileDropdown({ onClose, onSignOut }) {
  return (
    <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 9000, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.25)", width: 200, overflow: "hidden" }}>
      {[
        { label: "My Profile", href: "/profile" },
        { label: "My Issues", href: "/profile?tab=issues" },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          style={{ display: "block", padding: "11px 16px", fontSize: 14, color: "var(--text)", textDecoration: "none", fontWeight: 500 }}
        >
          {item.label}
        </Link>
      ))}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <button
          type="button"
          onClick={() => {
            onClose();
            onSignOut();
          }}
          style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", fontSize: 14, color: "var(--muted)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500 }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Nav() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    let cancelled = false;

    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        setNotifications(rows);
        setUnreadCount(rows.filter((n) => !n.read).length);
      } catch {
        if (!cancelled) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    }

    loadNotifications();
    const poll = setInterval(loadNotifications, 60000);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [status]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markAllRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
  }

  const iconBtnStyle = {
    background: "none",
    border: "1px solid var(--border)",
    cursor: "pointer",
    width: 36,
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted)",
    transition: "all 0.15s",
    position: "relative",
  };

  const user = session?.user;
  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <nav className="nav">
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Link href="/" className="nav-logo" style={{ marginRight: 8 }}>
            civil<span>ian</span>
          </Link>
          <div className="nav-links">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={`nav-link${router.pathname.startsWith(l.href) ? " active" : ""}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <a
            href="/compose"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 16px",
              borderRadius: 999,
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              color: "white",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Raise Issue
          </a>

          <Link href="/search" style={{ ...iconBtnStyle, textDecoration: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          {status === "authenticated" && (
            <div ref={notifRef} style={{ position: "relative" }}>
              <button type="button" onClick={() => { setShowNotifs((v) => !v); setShowProfile(false); }} style={iconBtnStyle}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "white", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <NotificationsDropdown
                  notifications={notifications}
                  onMarkAllRead={markAllRead}
                  onClose={() => setShowNotifs(false)}
                />
              )}
            </div>
          )}

          {status === "authenticated" ? (
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => { setShowProfile((v) => !v); setShowNotifs(false); }}
                style={{ ...iconBtnStyle, width: 32, height: 32, borderRadius: "50%", padding: 0, overflow: "hidden", borderColor: "rgba(37,99,235,0.35)" }}
                aria-label="Account menu"
              >
                {user?.image ? (
                  <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb" }}>{initials}</span>
                )}
              </button>
              {showProfile && (
                <ProfileDropdown
                  onClose={() => setShowProfile(false)}
                  onSignOut={() => signOut({ callbackUrl: "/" })}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: router.asPath || "/" })}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          )}

          <button type="button" className="nav-mobile-btn" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu">
            {mobileMenuOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer${mobileMenuOpen ? " open" : ""}`}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className={`nav-link${router.pathname.startsWith(l.href) ? " active" : ""}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}
