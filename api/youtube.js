// Vercel Serverless Function: /api/youtube
export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-YouTube-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const {
    endpoint = 'search',
    q,
    type,
    videoCategoryId,
    maxResults = '20',
    pageToken,
    id,
    part = 'snippet',
    chart,
    regionCode
  } = req.query;

  // Resolve API Key: Environment Variable takes precedence, or custom header from user settings
  const apiKey =
    process.env.YOUTUBE_API_KEY ||
    req.headers['x-youtube-api-key'] ||
    (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!apiKey || apiKey === 'MY_YOUTUBE_API_KEY') {
    return res.status(400).json({
      error: 'YOUTUBE_API_KEY is not configured.',
      message: 'Please provide YOUTUBE_API_KEY in Vercel environment variables or enter your key in Aura Music Settings.',
      code: 'API_KEY_MISSING'
    });
  }

  try {
    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('part', part);
    if (q) params.append('q', q);
    if (type) params.append('type', type);
    if (videoCategoryId) params.append('videoCategoryId', videoCategoryId);
    if (maxResults) params.append('maxResults', maxResults);
    if (pageToken) params.append('pageToken', pageToken);
    if (id) params.append('id', id);
    if (chart) params.append('chart', chart);
    if (regionCode) params.append('regionCode', regionCode);

    // Default music query filtering if searching
    if (endpoint === 'search' && !videoCategoryId && !type) {
      params.append('type', 'video');
      params.append('videoCategoryId', '10'); // Music category
    }

    const targetUrl = `https://www.googleapis.com/youtube/v3/${endpoint}?${params.toString()}`;
    const ytRes = await fetch(targetUrl);
    const data = await ytRes.json();

    if (!ytRes.ok) {
      const isQuota = data?.error?.errors?.some(e => e.reason === 'quotaExceeded');
      return res.status(ytRes.status).json({
        error: isQuota ? 'YouTube API daily quota exceeded.' : (data?.error?.message || 'YouTube API error.'),
        code: isQuota ? 'QUOTA_EXCEEDED' : 'API_ERROR',
        details: data?.error
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('YouTube API Proxy Error:', error);
    return res.status(500).json({
      error: 'Failed to communicate with YouTube API',
      message: error instanceof Error ? error.message : 'Unknown network error',
      code: 'NETWORK_ERROR'
    });
  }
}
