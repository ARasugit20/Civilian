import { insforge } from "../../lib/insforge";

const FALLBACK_POSTS = [
  { id: "fallback-1", complaint: "The crosswalk at Mill Ave and University Dr has no lighting. Kids nearly get hit every morning walking to school.", issue_type: "traffic_safety", location: "Mill Ave & University Dr, Tempe", echo_count: 34, status: "pending", lat: 33.4255, lng: -111.9400, author_name: "Maria Santos", author_role: "Parent & Resident", urgency_score: 9, created_at: new Date().toISOString() },
  { id: "fallback-2", complaint: "Three streetlights on Rural Road near the library have been out for 6 weeks. Seniors avoid walking at night.", issue_type: "street_lighting", location: "Rural Road near Library, Tempe", echo_count: 22, status: "sent", lat: 33.4142, lng: -111.9268, author_name: "James Thompson", author_role: "Business Owner", urgency_score: 7, created_at: new Date().toISOString() },
  { id: "fallback-3", complaint: "Kiwanis Park has no shade. Playground equipment reaches 160F in summer. Kids cannot play there at all.", issue_type: "parks_facilities", location: "Kiwanis Park, Tempe", echo_count: 48, status: "resolved", lat: 33.3964, lng: -111.9194, author_name: "Chen Wei", author_role: "Graduate Student", urgency_score: 6, created_at: new Date().toISOString() },
  { id: "fallback-4", complaint: "Massive pothole on Apache Blvd near Price Rd has been there 3 months. Already damaged 5 tires this week.", issue_type: "road_maintenance", location: "Apache Blvd & Price Rd, Tempe", echo_count: 31, status: "pending", lat: 33.4157, lng: -111.9185, author_name: "Roberto Garcia", author_role: "Homeowner", urgency_score: 8, created_at: new Date().toISOString() },
  { id: "fallback-5", complaint: "Late night drag racing on McClintock Dr wakes up the whole neighborhood every weekend after midnight.", issue_type: "noise_complaint", location: "McClintock Dr, Tempe", echo_count: 19, status: "pending", lat: 33.4019, lng: -111.9154, author_name: "Aisha Johnson", author_role: "Teacher", urgency_score: 5, created_at: new Date().toISOString() },
  { id: "fallback-6", complaint: "No crosswalk on Southern Ave near the elementary school. Children are crossing a 4-lane road unsafely daily.", issue_type: "traffic_safety", location: "Southern Ave & Rural Rd, Tempe", echo_count: 47, status: "sent", lat: 33.3819, lng: -111.9268, author_name: "Sarah Mitchell", author_role: "Nurse", urgency_score: 9, created_at: new Date().toISOString() },
  { id: "fallback-7", complaint: "Broken water main on Priest Dr has left a sinkhole growing for 2 weeks. Road is partially collapsed.", issue_type: "utilities", location: "Priest Dr, Tempe", echo_count: 23, status: "responded", lat: 33.4248, lng: -111.9558, author_name: "David Park", author_role: "Engineer", urgency_score: 10, created_at: new Date().toISOString() },
  { id: "fallback-8", complaint: "Graffiti has covered the entire underpass on Broadway Rd. It has been there for months with no cleanup.", issue_type: "other", location: "Broadway Rd Underpass, Tempe", echo_count: 12, status: "pending", lat: 33.4019, lng: -111.9200, author_name: "Linda Nguyen", author_role: "Small Business Owner", urgency_score: 4, created_at: new Date().toISOString() },
  { id: "fallback-9", complaint: "Tempe Town Lake path lighting is completely out for 400 meters. Joggers and cyclists at serious risk at night.", issue_type: "street_lighting", location: "Tempe Town Lake Path, Tempe", echo_count: 38, status: "pending", lat: 33.4281, lng: -111.9415, author_name: "Tyler Brooks", author_role: "College Student", urgency_score: 7, created_at: new Date().toISOString() },
  { id: "fallback-10", complaint: "Construction noise from the ASU project on University Dr starts at 5am daily violating city noise ordinances.", issue_type: "noise_complaint", location: "University Dr & Rural Rd, Tempe", echo_count: 29, status: "pending", lat: 33.4248, lng: -111.9268, author_name: "Fatima Al-Hassan", author_role: "Retiree", urgency_score: 6, created_at: new Date().toISOString() },
];

async function geocodeLocation(location) {
  try {
    const query = encodeURIComponent(`${location}, Tempe, Arizona`);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=US`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return { lat: null, lng: null };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (id) {
      // Serve fallback posts directly without hitting DB
      if (id.startsWith("fallback-")) {
        const post = FALLBACK_POSTS.find(p => p.id === id);
        if (post) return res.status(200).json(post);
        return res.status(404).json({ error: "Not found" });
      }

      const { data, error } = await insforge.database
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        const post = FALLBACK_POSTS.find(p => p.id === id);
        if (post) return res.status(200).json(post);
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(200).json(data);
    }

    const { issue_type: filterType } = req.query;

    let query = insforge.database
      .from("posts")
      .select("*");

    const sort = req.query.sort || "new";
    if (sort === "trending") query = query.order("echo_count", { ascending: false });
    else if (sort === "urgent") query = query.order("urgency_score", { ascending: false });
    else query = query.order("created_at", { ascending: false }); // default: new

    if (filterType) query = query.eq("issue_type", filterType);

    const { data, error } = await query;
    if (error) {
      console.warn("DB unavailable, using fallback posts:", error.message);
      const fallback = filterType ? FALLBACK_POSTS.filter(p => p.issue_type === filterType) : FALLBACK_POSTS;
      return res.status(200).json(fallback);
    }
    const list = Array.isArray(data) ? data : [];
    return res.status(200).json(list.length ? list : FALLBACK_POSTS);
  }

  if (req.method === "POST") {
    const {
      complaint,
      formal_request,
      department,
      official_name,
      official_email,
      issue_type,
      location,
      video_url,
      urgency_score,
    } = req.body;

    // Geocode the location to get real coordinates
    const { lat, lng } = await geocodeLocation(location || "Tempe, Arizona");

    const newPost = {
      complaint,
      formal_request,
      department,
      official_name,
      official_email,
      issue_type,
      location,
      lat,
      lng,
      echo_count: 1,
      status: "pending",
      video_url: video_url || null,
      urgency_score: urgency_score ? Number(urgency_score) : null,
    };

    try {
      const { data, error } = await insforge.database
        .from("posts")
        .insert([newPost])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return res.status(200).json(data);
    } catch (err) {
      console.error("DB save failed:", err.message);
      return res.status(503).json({
        error: "save_failed",
        message: "Your complaint could not be saved right now. Please try again. Your text has not been lost.",
      });
    }
  }

  return res.status(405).end();
}
