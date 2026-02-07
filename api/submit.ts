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
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return res.status(500).json({
      ok: false,
      error: 'missing_env',
      detail: 'NOTION_TOKEN / NOTION_DATABASE_ID are required',
    });
  }

  try {
    // 기대 형태: { url: string; title?: string; notes?: string }
    const { url, title, notes } = (req.body || {}) as {
      url?: string;
      title?: string;
      notes?: string;
    };

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ ok: false, error: 'url is required' });
    }
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid url' });
    }

    // Notion properties
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

    // Notes → DB 속성 (rich_text)
    const notesText =
      typeof notes === 'string' && notes.trim().length
        ? notes.toString().slice(0, 2000)
        : '';

    if (notesText) {
      properties.Notes = {
        rich_text: [{ type: 'text', text: { content: notesText } }],
      };
    }

    // Notes → 페이지 본문(children 블록)
    const children = notesText
      ? [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: notesText } }],
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
      return res.status(r.status).json({ ok: false, error: 'notion_error', detail: text });
    }
    
    // --- 여기서부터 텔레그램 전송 로직 추가 ---
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const message = `🚀 **노션 등록 완료**\n\n📌 **제목**: ${title || url}\n📝 **메모**: ${notes || '없음'}\n🔗 [링크 바로가기](${url})`;
        console.log("messs",message);
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown', // 링크 등을 예쁘게 표시
          }),
        });
      } catch (teleErr) {
        console.error('Telegram notification failed:', teleErr);
        // 텔레그램 실패가 노션 등록 실패는 아니므로 응답은 그대로 진행합니다.
      }
    }
    // --- 텔레그램 로직 끝 ---
    
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
