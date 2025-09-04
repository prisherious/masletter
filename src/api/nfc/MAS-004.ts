// /api/nfc/[tagId].ts
export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }
  const p = req.query?.tagId;
  const tagId = Array.isArray(p) ? p[0] : p;
  if (!tagId) {
    res.status(400).send("Missing tagId");
    return;
  }
  // Minimal: leite auf deine Client-Route um
  res.setHeader("Cache-Control", "no-store");
  res.writeHead(302, { Location: `/recipes/${encodeURIComponent(tagId)}` });
  res.end();
}
