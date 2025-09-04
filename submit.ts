// api/submit.ts (Vercel)
import type { VercelRequest, VercelResponse } from '@vercel/node';

const NOTION_TOKEN = process.env.NOTION_TOKEN as string;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID as string;
const NOTION_VERSION = '2022-06-28';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const { url, title, notes } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ ok: false, error: 'url is required' });
    }

    // 간단 URL 유효성 검사
    try { new URL(url); } catch { return res.status(400).json({ ok: false, error: 'invalid url' }); }

    const payload = {
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        Title: { title: [{ type: 'text', text: { content: title?.trim() || url } }] },
        URL: { url },
      },
      children: notes
        ? [{
            object: 'block', type: 'paragraph',
            paragraph: { rich_text: [{ type: 'text', text: { content: notes.toString().slice(0, 2000) } }] }
          }]
        : [],
    };

    const r = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ ok: false, error: 'notion_error', detail: text });
    }

    const data = await r.json();
    return res.status(200).json({ ok: true, page_id: data.id });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: 'server_error', detail: err?.message });
  }
}
