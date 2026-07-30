import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filePath = getFilePath();
    
    if (!body.categories || !body.projects) {
      return NextResponse.json({ error: "Missing categories or projects" }, { status: 400 });
    }

    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}
