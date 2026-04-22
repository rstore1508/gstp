// Vercel Serverless Function — Proxy para atualizar produto na wBuy
// Rota: PUT /api/update  body: { id: "123", preco_venda: 199.90 }

const WBUY_API = 'https://sistema.sistemawbuy.com.br/api/v1';
const WBUY_BEARER = 'Njk1ODQ0ZDEtMzY5Zi00MTliLTk5MGMtZThmZjYwNTRlYTFiOjQ4Mjc1MjYwOTUzMDQ2MGZhOWU1NmIzNDY5ZmEwNTZj';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PUT' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, preco_venda, ...otherFields } = req.body || {};

    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const apiUrl = `${WBUY_API}/product/${id}`;
        const updatePayload = { preco_venda, ...otherFields };

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${WBUY_BEARER}`,
                'User-Agent': 'UseRelogio (contato@userelogio.com.br)',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatePayload)
        });

        const rawText = await response.text();

        if (!response.ok) {
            console.error(`wBuy update error: ${response.status} — ${rawText.substring(0, 500)}`);
            return res.status(response.status).json({
                error: 'wBuy update failed',
                status: response.status,
                detail: rawText.substring(0, 300)
            });
        }

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            data = { raw: rawText.substring(0, 300) };
        }

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('Proxy update error:', error);
        return res.status(500).json({
            error: 'Proxy connection failed',
            message: error.message
        });
    }
}
