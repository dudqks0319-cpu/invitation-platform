import { NextResponse } from "next/server";
import { fetchSafeTemplates } from "@/lib/template-repository";
import { buildTemplateResponse } from "@/lib/template-api-response";

export async function GET() {
  const templates = await fetchSafeTemplates();

  const response = NextResponse.json(buildTemplateResponse(templates));
  response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

  return response;
}
