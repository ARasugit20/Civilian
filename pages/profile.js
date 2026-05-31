import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Nav from "../components/Nav";
import { insforge } from "../lib/insforge";

const TABS = ["My Issues", "My Echoes"];

const TYPE_COLORS = {
  traffic: "#f59e0b",
  street_lighting: "#818cf8",
  road_maintenance: "#a78bfa",
  parks_facilities: "#22c55e",
  noise_complaint: "#f97316",
  housing: "#ef4444",
  utilities: "#94a3b8",
  other: "#94a3b8",
};

function formatMemberSince(value) {
  if (!value) return "Member recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Member recently";
  return `Member since ${date.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("My Issues");
  const [myIssues, setMyIssues] = useState([]);
  const [myEchoes, setMyEchoes] = useState([]);
  const [memberSince, setMemberSince] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = router.query.tab;
    if (tab === "issues") setActiveTab("My Issues");
    if (tab === "echoes") setActiveTab("My Echoes");
  }, [router.query.tab]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      try {
        const [profileRes, issuesRes, echoesRes] = await Promise.all([
          insforge.database.from("profiles").select("created_at").eq("id", session.user.id).maybeSingle(),
          fetch(`/api/posts?user_id=${encodeURIComponent(session.user.id)}`),
          fetch("/api/posts?echoed=1"),
        ]);

        const issuesData = await issuesRes.json();
        const echoesData = await echoesRes.json();

        if (!cancelled) {
          setMemberSince(profileRes?.data?.created_at || null);
          setMyIssues(Array.isArray(issuesData) ? issuesData : []);
          setMyEchoes(Array.isArray(echoesData) ? echoesData : []);
        }
      } catch {
        if (!cancelled) {
          setMyIssues([]);
          setMyEchoes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, status]);

  const user = session?.user;
  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const tabPosts = activeTab === "My Issues" ? myIssues : myEchoes;

  if (status === "unauthenticated") {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Nav />
        <div style={{ maxWidth: 520, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Sign in to view your profile</h1>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Your issues and echoes are tied to your Google account.</p>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/profile" })}
            style={{ padding: "12px 20px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      <div style={{ height: 180, background: "linear-gradient(135deg, #2563eb, #7c3aed, #06b6d4)", position: "relative" }} />

      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px 24px", position: "relative" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--surface)", border: "4px solid var(--surface)", position: "absolute", top: -40, left: 32, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {user?.image ? (
              <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 24, fontWeight: 800, color: "#2563eb" }}>{initials}</span>
            )}
          </div>

          <div style={{ paddingTop: 52 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: -0.3 }}>{user?.name || "Community Member"}</h1>
            <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>{formatMemberSince(memberSince)}</p>
          </div>

          <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{loading ? "—" : myIssues.length}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Issues Raised</p>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{loading ? "—" : myEchoes.length}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Issues Echoed</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px", display: "flex" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "14px 20px",
                border: "none",
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                color: activeTab === tab ? "var(--blue)" : "var(--muted)",
                borderBottom: activeTab === tab ? "2px solid var(--blue)" : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 32px" }}>
        {loading ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading...</p>
        ) : tabPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              {activeTab === "My Echoes" ? "No echoed issues yet" : "No issues raised yet"}
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>
              {activeTab === "My Echoes" ? "Echo issues in the feed to see them here." : "Raise your first issue to start building your civic record."}
            </p>
            <Link href="/compose" style={{ padding: "10px 24px", borderRadius: 999, background: "#2563eb", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              Raise your first issue
            </Link>
          </div>
        ) : (
          tabPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} style={{ display: "block", textDecoration: "none", marginBottom: 10 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", boxShadow: "var(--card-shadow)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[post.issue_type] || "#94a3b8" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: TYPE_COLORS[post.issue_type] || "#94a3b8" }}>
                    {(post.issue_type || "other").replace(/_/g, " ")}
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", lineHeight: 1.55, marginBottom: 10 }}>{post.complaint}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{post.location}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>{post.echo_count || 0} voices</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
