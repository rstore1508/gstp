// Vercel Serverless Function — Proxy para API wBuy (evita CORS)
// Rota: GET /api/products?page=1&limit=50

const WBUY_API = 'https://sistema.sistemawbuy.com.br/api/v1';
const WBUY_BEARER = 'Njk1ODQ0ZDEtMzY5Zi00MTliLTk5MGMtZThmZjYwNTRlYTFiOjQ4Mjc1MjYwOTUzMDQ2MGZhOWU1NmIzNDY5ZmEwNTZj';

export default async function handler(req, res) {
    // CORS headers for the frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const page = req.query.page || '1';
    const limit = req.query.limit || '50';

    try {
        const apiUrl = `${WBUY_API}/product?page=${page}&limit=${limit}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${WBUY_BEARER}`,
                'User-Agent': 'UseRelogio (contato@userelogio.com.br)',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const contentType = response.headers.get('content-type') || '';
        const rawText = await response.text();

        if (!response.ok) {
            console.error(`wBuy API error: ${response.status} — ${rawText.substring(0, 500)}`);
            return res.status(response.status).json({
                error: 'wBuy API error',
                status: response.status,
                detail: rawText.substring(0, 300)
            });
        }

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            return res.status(502).json({
                error: 'Invalid JSON from wBuy',
                raw: rawText.substring(0, 500)
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            error: 'Proxy connection failed',
            message: error.message
        });
    }
}
