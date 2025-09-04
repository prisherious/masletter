// /api/hello.ts
export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true, now: new Date().toISOString() });
}
