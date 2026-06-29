export const dynamic = "force-dynamic";

import { db } from "@/db";
import { agentLogs } from "@/db/schema"; // or wherever this actually lives

export async function GET() {
  const logs = await db.query.agentLogs.findMany({
    limit: 100,
    orderBy: (t, { desc }) => desc(t.created_at),
  });

  return Response.json(logs);
}
