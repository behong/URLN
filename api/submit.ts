// api/submit.ts
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
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return res.status(500).json({
      ok: false,
      error: 'missing_env',
      detail: 'NOTION_TOKEN / NOTION_DATABASE_ID are required',
    });
  }

  try {
    const { url, title, notes, category } = (req.body || {}) as {
      url?: string;
      title?: string;
      notes?: string;
      category?: string[];
    };

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ ok: false, error: 'url is required' });
    }
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid url' });
    }

    const properties: Record<string, any> = {
      Title: {
        title: [
          {
            type: 'text',
            text: { content: (title?.trim() || url).slice(0, 2000) },
          },
        ],
      },
      URL: { url },
    };

    // 카테고리 → multi-select
    if (Array.isArray(category) && category.length) {
      properties.Category = {
        multi_select: category
          .map((name) => (typeof name === 'string' ? name.trim() : ''))
          .filter((name) => !!name)
          .map((name) => ({ name })),
      };
    }

    // Notes → DB 속성(rich_text)
    if (typeof notes === 'string' && notes.trim().length) {
      properties.Notes = {
        rich_text: [
          {
            type: 'text',
            text: { content: notes.toString().slice(0, 2000) },
          },
        ],
      };
    }

    // Notes → 본문(children 블록)
    const children =
      typeof notes === 'string' && notes.trim().length
        ? [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content: notes.toString().slice(0, 2000) },
                  },
                ],
              },
            },
          ]
        : [];

    const payload = {
      parent: { database_id: NOTION_DATABASE_ID },
      properties,
      children,
    };

    const r = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(r.status)
        .json({ ok: false, error: 'notion_error', detail: text });
    }

    const data = (await r.json()) as { id: string };
    return res.status(200).json({ ok: true, page_id: data.id });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: 'server_error',
      detail: err?.message || String(err),
    });
  }
}
