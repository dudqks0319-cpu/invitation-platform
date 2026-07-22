import { NextResponse } from "next/server";
import { buildPublicMobileTemplateCatalog } from "@/lib/mobile-template-catalog";
import { templates } from "@/lib/templates";

export async function GET() {
  const { body } = buildPublicMobileTemplateCatalog(templates);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": String(Buffer.byteLength(body, "utf8")),
      "X-Content-Type-Options": "nosniff"
    }
  });
}
