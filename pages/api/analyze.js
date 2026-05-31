import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, getClientIp } from "../../lib/rateLimit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Content moderation — reject harmful content before hitting Claude
const POLICY_PATTERNS = [
  /\b(kill|murder|shoot|stab|bomb|attack|assault|rape|lynch|hang)\b/i,
  /\b(nigger|faggot|chink|spic|kike|wetback|tranny)\b/i,
  /\b(hate|destroy|eliminate|exterminate)\s+(all\s+)?(jews?|muslims?|blacks?|whites?|gays?|immigrants?)\b/i,
  /\b(go\s+die|kys|kill\s+yourself|end\s+your\s+life)\b/i,
  /\b(terrorist|jihad|isis|al.?qaeda)\b/i,
  /\b(child\s+porn|cp|csam|pedophil)\b/i,
];

function moderateContent(text) {
  for (const pattern of POLICY_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  return true;
}

const SYSTEM_PROMPT = `You are a civic complaint classifier and letter writer for Civilian, a local government engagement platform.

STEP 1 — VALIDATE THE COMPLAINT
REJECT (rejected: true) if the complaint:
- Does not describe a specific, observable, physical local issue
- Does not include or imply a specific location
- Targets a named individual by name as the subject
- Expresses a political opinion rather than describing a problem
- Is a policy suggestion not a specific reportable issue
- Contains abusive, threatening, or discriminatory language
- Is outside local government jurisdiction
- The issue is on private property not maintained by the city (landlord disputes, HOA issues, interior building problems)
- The responsible authority is federal or state, not local government (post office, highways, federal buildings)
- The complaint is too vague to route to a specific department (no observable specific condition described)

ACCEPT (rejected: false) if the complaint describes a specific physical problem with a location that is within local government jurisdiction.

IF REJECTED return ONLY this JSON:
{"rejected": true, "reason": "<exactly one of: no_location | targets_individual | political_opinion | policy_suggestion | abusive_content | outside_jurisdiction | not_specific_enough | private_property_or_hoa | non_local_government | too_vague_to_route>", "reframe_suggestion": "<one specific sentence telling the user how to rewrite their complaint>"}

IF ACCEPTED search the web to find every real contact channel available for this
specific complaint. The channels vary by city, country, and issue type — find what
actually exists, not what you assume should exist.

Do up to 5 web searches in this order:

Search 1: Find the responsible official's name, title, and direct email
Query: '[city] [state/country] [issue type] responsible official email site:.gov'

Search 2: Find the department's general inbox or reporting email
Query: '[city] [department name] report contact email'

Search 3: Find the city's online reporting portal or 311 web form URL
Query: '[city] [state/country] report [issue type] online portal'

Search 4: Find the city's phone number for this issue type
Query: '[city] [state/country] [issue type] report phone number'

Search 5: Find the physical mailing address of the responsible department
Query: '[city] [state/country] [department name] mailing address'

Rules for all searches:
- Only return information you actually found in search results from official sources
- Do not guess, construct, or infer any contact details
- Do not hardcode or assume anything for any city or country
- If a channel does not exist or cannot be verified, return null for that field
- This applies universally — every city, every country, every issue type

Then return ONLY this JSON:
{
  "rejected": false,
  "issue_type": "<traffic_safety|street_lighting|road_maintenance|parks_facilities|noise_complaint|housing|utilities|sanitation|other>",
  "severity": "<critical|urgent|standard|suggestion>",
  "department": "<real department name found in search>",
  "official_name": "<real name and title found in search, or null>",
  "location_extracted": "<location from complaint>",
  "urgency_score": <1-10>,
  "language": "<ISO 639-1 code of language user wrote in>",
  "ordinance": "<relevant local ordinance or statute number if found, or null>",
  "formal_request": "<complete formal letter in same language user wrote in, 3-4 paragraphs, citing ordinance if found, signed as Concerned Residents>",
  "contact_channels": [
    {
      "type": "email_direct",
      "label": "<human readable label e.g. 'Email Shelly Seyler, Deputy Director'>",
      "value": "<verified .gov email address>",
      "source_url": "<url where this was found>",
      "available": true
    },
    {
      "type": "email_department",
      "label": "<human readable label e.g. 'Email Transportation Department'>",
      "value": "<verified department .gov email>",
      "source_url": "<url where this was found>",
      "available": true
    },
    {
      "type": "online_portal",
      "label": "<human readable label e.g. 'Submit via Tempe 311 Portal' or 'Submit via FixMyStreet' or 'Submit via NYC311'>",
      "value": "<verified URL of the reporting portal>",
      "source_url": "<url where this was found>",
      "available": true
    },
    {
      "type": "phone",
      "label": "<human readable label e.g. 'Call Tempe 311' or 'Call Transportation Maintenance'>",
      "value": "<verified phone number>",
      "source_url": "<url where this was found>",
      "available": true
    },
    {
      "type": "mail",
      "label": "<human readable label e.g. 'Send Letter by Post'>",
      "value": "<verified mailing address of department>",
      "source_url": "<url where this was found>",
      "available": true
    }
  ]
}

Rules for contact_channels:
- Only include a channel in the array if you actually found verified information for it
- Do not include a channel with null or empty value — omit it entirely
- The array can have 1 item or 5 items depending on what actually exists
- Order channels by how actionable they are: email_direct first, then email_department,
  then online_portal, then phone, then mail
- The label must be specific and human-readable — never generic like "Email Official"
- Every channel needs a source_url showing where you found it

LETTER WRITING RULES:
- Only describe what the resident explicitly reported. Do not fabricate or assume specific incidents, injuries, near-misses, or consequences that were not mentioned in the original complaint.
- Do not add dramatic language about foreseeable fatalities, injuries, or emergencies unless the resident specifically described them.
- Write factually based only on what was submitted.

CRITICAL: Response must be ONLY valid JSON. No markdown, no backticks, no text before or after. If any email not found, use empty string.`;

function isGovEmail(email) {
  return typeof email === "string" && /\.(gov)(\/|$|:)|\.gov$/.test(email);
}

function sanitizeResponse(data) {
  if (data.rejected) return data;

  // Validate contact_channels — remove any channel missing type, label, or value
  const validTypes = [
    "email_direct",
    "email_department",
    "online_portal",
    "phone",
    "mail",
  ];

  const cleanChannels = Array.isArray(data.contact_channels)
    ? data.contact_channels.filter((ch) => {
        if (!ch || !ch.type || !ch.value || !ch.label) return false;
        if (!validTypes.includes(ch.type)) return false;
        // Validate email channels must contain @ and a dot
        if (ch.type.startsWith("email") && !/.+@.+\..+/.test(ch.value)) return false;
        // Validate portal channels must be a URL
        if (ch.type === "online_portal" && !ch.value.startsWith("http")) return false;
        return true;
      })
    : [];

  // Flag if no channels found at all
  const noChannelsFound = cleanChannels.length === 0;

  return {
    ...data,
    contact_channels: cleanChannels,
    no_channels_found: noChannelsFound,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const maxPerWindow = Number(process.env.ANALYZE_RATE_LIMIT_MAX) || 8;
  const windowMs = Number(process.env.ANALYZE_RATE_LIMIT_WINDOW_MS) || 60_000;
  const rl = rateLimit(`analyze:${getClientIp(req)}`, { max: maxPerWindow, windowMs });
  if (rl.limited) {
    return res.status(429).json({
      error: "rate_limited",
      message: "Too many analysis requests. Please wait a minute and try again.",
      retryAfterMs: rl.retryAfterMs,
    });
  }

  const { complaint, location, imageBase64, imageMediaType, language, highSensitivity } = req.body;

  const sanitizedComplaint = String(complaint || "").slice(0, 2000).trim();
  const sanitizedLocation = String(location || "").slice(0, 200).trim();
  if (!sanitizedComplaint) return res.status(400).json({ error: "Complaint text is required" });

  // Content policy check
  if (!moderateContent(sanitizedComplaint)) {
    return res.status(400).json({
      error: "content_policy",
      message: "Your post contains content that violates our community guidelines. Civilian does not allow violent, hateful, or abusive language. Please describe your civic issue respectfully.",
    });
  }

  try {
    const userContent = [];
    if (imageBase64) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type:  imageMediaType || "image/jpeg",
          data: imageBase64,
        },
      });
    }
    userContent.push({
      type: "text",
      text: `Community complaint: ${sanitizedComplaint}\n\nLocation: ${sanitizedLocation || "Tempe, Arizona"}\n\nSearch the web as instructed to find every real contact channel available for this complaint — email, online portal, phone, and mailing address. Then respond with ONLY the JSON object described in your instructions.`,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: highSensitivity
        ? `PRIVACY MODE: Before processing, strip any personally identifying details (names, phone numbers, addresses, emails, ID numbers) from the complaint. Do not include them in any output field.\n\n${SYSTEM_PROMPT}`
        : SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        }
      ],
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    console.log("Claude response blocks:", JSON.stringify(message.content.map(b => b.type)));

    // Get the last text block (after all tool use)
    const textBlock = message.content.findLast(block => block.type === "text");
    if (!textBlock) throw new Error("No text response from Claude");

    const raw = textBlock.text.trim();

    // Try direct parse first
    try {
      const data = JSON.parse(raw);
      return res.status(200).json(sanitizeResponse(data));
    } catch {
      // Fall back to extracting JSON from text
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("Raw response:", raw);
        throw new Error("No JSON found in response");
      }
      const data = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      return res.status(200).json(sanitizeResponse(data));
    }
  } catch (err) {
    console.error("Claude API error:", JSON.stringify({
      message: err.message,
      status: err.status,
      raw: err?.error,
    }));
    return res.status(500).json({ 
      error: err.message,
      detail: err?.error || null 
    });
  }
}
