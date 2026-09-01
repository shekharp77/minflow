import { llmsFull } from "@/lib/llms";

/* Static, so it survives `output: "export"` and ships as a plain file. */
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFull(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
