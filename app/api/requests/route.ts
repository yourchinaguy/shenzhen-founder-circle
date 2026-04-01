import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const VALID_CATEGORIES = [
  "factory_supplier", "local_hire", "expert_call",
  "investor", "government_regulatory", "other",
];
const VALID_URGENCIES = ["this_week", "this_month", "exploring"];
const VALID_STATUSES = ["new", "reviewing", "need_more_info", "intro_made", "closed", "discarded"];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function isAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7));
  return user?.email === process.env.ADMIN_EMAIL;
}

// POST — public, rate-limited
export async function POST(request: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const { allowed } = rateLimit(`sfc:${ip}`, 3);

  if (!allowed) {
    return Response.json(
      { error: "You've submitted 3 requests today. Try again tomorrow." },
      { status: 429 }
    );
  }

  let body: {
    name?: string;
    email?: string;
    company?: string;
    linkedin_url?: string | null;
    twitter_url?: string | null;
    website_url?: string | null;
    category?: string;
    industry?: string;
    description?: string;
    urgency?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.email?.trim() || !body.company?.trim() || !body.description?.trim()) {
    return Response.json({ error: "Name, email, company, and description are required." }, { status: 400 });
  }

  if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
    return Response.json({ error: "Please select a valid category." }, { status: 400 });
  }

  const urgency = body.urgency && VALID_URGENCIES.includes(body.urgency) ? body.urgency : "exploring";

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("requests").insert({
      name: body.name.trim(),
      email: body.email.trim(),
      company: body.company.trim(),
      linkedin_url: body.linkedin_url?.trim() || null,
      twitter_url: body.twitter_url?.trim() || null,
      website_url: body.website_url?.trim() || null,
      category: body.category,
      industry: body.industry || null,
      description: body.description.trim(),
      urgency,
      status: "new",
    });

    if (error) throw error;
    return Response.json({ success: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

// GET — admin only
export async function GET(request: Request) {
  if (!(await isAdmin(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Response.json({ requests: data ?? [] });
  } catch {
    return Response.json({ error: "Failed to load requests." }, { status: 500 });
  }
}

// PATCH — admin only, update status/notes
export async function PATCH(request: Request) {
  if (!(await isAdmin(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string; status?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.id) {
    return Response.json({ error: "Request ID is required." }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (body.status && VALID_STATUSES.includes(body.status)) updates.status = body.status;
  if (body.notes !== undefined) updates.notes = body.notes;

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("requests")
      .update(updates)
      .eq("id", body.id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update request." }, { status: 500 });
  }
}
