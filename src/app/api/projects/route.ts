import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const getFilePath = () => {
  return path.join(process.cwd(), "src", "lib", "projects_data.json");
};

export async function GET() {
  try {
    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ categories: [], projects: [] });
    }
    const data = fs.readFileSync(filePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`projects_write_${ip}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 1. Authenticate Request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing authentication token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const clientUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authErr } = await clientUser.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired session" }, { status: 401 });
    }

    // 2. Authorize Admin Role
    const { data: profile, error: profileErr } = await clientUser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Administrator role required" }, { status: 403 });
    }

    // 3. Validate & Sanitize Payload
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const { categories, projects } = body;
    if (!Array.isArray(categories) || !Array.isArray(projects)) {
      return NextResponse.json({ error: "Categories and projects must both be arrays" }, { status: 400 });
    }

    // Validate categories structure
    const sanitizedCategories = categories.map((cat: any, idx: number) => {
      if (!cat || typeof cat !== "object") {
        throw new Error(`Invalid category format at index ${idx}`);
      }
      return {
        id: String(cat.id || `cat_${idx}`),
        name_ar: String(cat.name_ar || "").slice(0, 100),
        name_en: String(cat.name_en || "").slice(0, 100),
      };
    });

    // Validate projects structure
    const sanitizedProjects = projects.map((proj: any, idx: number) => {
      if (!proj || typeof proj !== "object") {
        throw new Error(`Invalid project format at index ${idx}`);
      }
      return {
        id: String(proj.id || `proj_${idx}`),
        title_ar: String(proj.title_ar || "").slice(0, 200),
        title_en: String(proj.title_en || "").slice(0, 200),
        category: String(proj.category || "").slice(0, 100),
        curtainType: String(proj.curtainType || "").slice(0, 100),
        clientType: String(proj.clientType || "").slice(0, 100),
        fabricOrigin: String(proj.fabricOrigin || "").slice(0, 100),
        date: String(proj.date || "").slice(0, 50),
        images: Array.isArray(proj.images) ? proj.images.map((img: any) => String(img).slice(0, 500)) : [],
      };
    });

    const sanitizedData = {
      categories: sanitizedCategories,
      projects: sanitizedProjects,
    };

    const filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(sanitizedData, null, 2), "utf8");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
