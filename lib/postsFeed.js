export const FALLBACK_POSTS = [
  { id: "fallback-1", complaint: "The crosswalk at Mill Ave and University Dr has no lighting. Kids nearly get hit every morning walking to school.", issue_type: "traffic_safety", location: "Mill Ave & University Dr, Tempe", echo_count: 34, status: "pending", lat: 33.4255, lng: -111.94, author_name: "Maria Santos", author_role: "Parent & Resident", urgency_score: 9, created_at: "2026-01-15T10:00:00.000Z" },
  { id: "fallback-2", complaint: "Three streetlights on Rural Road near the library have been out for 6 weeks. Seniors avoid walking at night.", issue_type: "street_lighting", location: "Rural Road near Library, Tempe", echo_count: 22, status: "sent", lat: 33.4142, lng: -111.9268, author_name: "James Thompson", author_role: "Business Owner", urgency_score: 7, created_at: "2026-01-14T10:00:00.000Z" },
  { id: "fallback-3", complaint: "Kiwanis Park has no shade. Playground equipment reaches 160F in summer. Kids cannot play there at all.", issue_type: "parks_facilities", location: "Kiwanis Park, Tempe", echo_count: 48, status: "resolved", lat: 33.3964, lng: -111.9194, author_name: "Chen Wei", author_role: "Graduate Student", urgency_score: 6, created_at: "2026-01-13T10:00:00.000Z" },
  { id: "fallback-4", complaint: "Massive pothole on Apache Blvd near Price Rd has been there 3 months. Already damaged 5 tires this week.", issue_type: "road_maintenance", location: "Apache Blvd & Price Rd, Tempe", echo_count: 31, status: "pending", lat: 33.4157, lng: -111.9185, author_name: "Roberto Garcia", author_role: "Homeowner", urgency_score: 8, created_at: "2026-01-12T10:00:00.000Z" },
  { id: "fallback-5", complaint: "Late night drag racing on McClintock Dr wakes up the whole neighborhood every weekend after midnight.", issue_type: "noise_complaint", location: "McClintock Dr, Tempe", echo_count: 19, status: "pending", lat: 33.4019, lng: -111.9154, author_name: "Aisha Johnson", author_role: "Teacher", urgency_score: 5, created_at: "2026-01-11T10:00:00.000Z" },
  { id: "fallback-6", complaint: "No crosswalk on Southern Ave near the elementary school. Children are crossing a 4-lane road unsafely daily.", issue_type: "traffic_safety", location: "Southern Ave & Rural Rd, Tempe", echo_count: 47, status: "sent", lat: 33.3819, lng: -111.9268, author_name: "Sarah Mitchell", author_role: "Nurse", urgency_score: 9, created_at: "2026-01-10T10:00:00.000Z" },
  { id: "fallback-7", complaint: "Broken water main on Priest Dr has left a sinkhole growing for 2 weeks. Road is partially collapsed.", issue_type: "utilities", location: "Priest Dr, Tempe", echo_count: 23, status: "responded", lat: 33.4248, lng: -111.9558, author_name: "David Park", author_role: "Engineer", urgency_score: 10, created_at: "2026-01-09T10:00:00.000Z" },
  { id: "fallback-8", complaint: "Graffiti has covered the entire underpass on Broadway Rd. It has been there for months with no cleanup.", issue_type: "other", location: "Broadway Rd Underpass, Tempe", echo_count: 12, status: "pending", lat: 33.4019, lng: -111.92, author_name: "Linda Nguyen", author_role: "Small Business Owner", urgency_score: 4, created_at: "2026-01-08T10:00:00.000Z" },
  { id: "fallback-9", complaint: "Tempe Town Lake path lighting is completely out for 400 meters. Joggers and cyclists at serious risk at night.", issue_type: "street_lighting", location: "Tempe Town Lake Path, Tempe", echo_count: 38, status: "pending", lat: 33.4281, lng: -111.9415, author_name: "Tyler Brooks", author_role: "College Student", urgency_score: 7, created_at: "2026-01-07T10:00:00.000Z" },
  { id: "fallback-10", complaint: "Construction noise from the ASU project on University Dr starts at 5am daily violating city noise ordinances.", issue_type: "noise_complaint", location: "University Dr & Rural Rd, Tempe", echo_count: 29, status: "pending", lat: 33.4248, lng: -111.9268, author_name: "Fatima Al-Hassan", author_role: "Retiree", urgency_score: 6, created_at: "2026-01-06T10:00:00.000Z" },
];

export const DB_READ_TIMEOUT_MS = Number(process.env.INSFORGE_READ_TIMEOUT_MS) || 4000;

export function withDbTimeout(task, ms = DB_READ_TIMEOUT_MS, label = "InsForge read") {
  const executed = typeof task === "function" ? task() : Promise.resolve(task);
  return Promise.race([
    executed,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

export function sortPosts(posts, sort = "new") {
  const copy = [...posts];
  if (sort === "trending") {
    return copy.sort((a, b) => (b.echo_count || 0) - (a.echo_count || 0));
  }
  if (sort === "urgent") {
    return copy.sort((a, b) => (b.urgency_score || 0) - (a.urgency_score || 0));
  }
  return copy.sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

export function resolveFallbackPosts({ sort = "new", filterType, userId } = {}) {
  if (userId) return [];
  let posts = [...FALLBACK_POSTS];
  if (filterType) {
    posts = posts.filter((p) => p.issue_type === filterType);
  }
  return sortPosts(posts, sort);
}

export function resolveFeedPosts({ data, error, sort = "new", filterType, userId } = {}) {
  if (error || !Array.isArray(data) || data.length === 0) {
    return resolveFallbackPosts({ sort, filterType, userId });
  }
  let posts = [...data];
  if (filterType) {
    posts = posts.filter((p) => p.issue_type === filterType);
  }
  if (userId) {
    posts = posts.filter((p) => p.user_id === userId);
  }
  return sortPosts(posts, sort);
}
