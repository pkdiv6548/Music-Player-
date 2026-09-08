import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function youtubeApiDevPlugin(): Plugin {
  return {
    name: 'youtube-api-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/youtube', async (req, res) => {
        const parsedUrl = new URL(req.url || '', 'http://localhost:3000');
        const endpoint = parsedUrl.searchParams.get('endpoint') || 'search';
        const q = parsedUrl.searchParams.get('q');
        const type = parsedUrl.searchParams.get('type');
        const videoCategoryId = parsedUrl.searchParams.get('videoCategoryId');
        const maxResults = parsedUrl.searchParams.get('maxResults') || '20';
        const pageToken = parsedUrl.searchParams.get('pageToken');
        const id = parsedUrl.searchParams.get('id');
        const part = parsedUrl.searchParams.get('part') || 'snippet';
        const chart = parsedUrl.searchParams.get('chart');
        const regionCode = parsedUrl.searchParams.get('regionCode');
        const headerKey = req.headers['x-youtube-api-key'] as string;
        const apiKey = process.env.YOUTUBE_API_KEY || headerKey;

        res.setHeader('Content-Type', 'application/json');

        if (!apiKey || apiKey === 'MY_YOUTUBE_API_KEY') {
          res.statusCode = 400;
          res.end(JSON.stringify({
            error: 'YOUTUBE_API_KEY is not configured.',
            message: 'Please provide YOUTUBE_API_KEY in environment or enter your key in Aura Music Settings.',
            code: 'API_KEY_MISSING'
          }));
          return;
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

          if (endpoint === 'search' && !videoCategoryId && !type) {
            params.append('type', 'video');
            params.append('videoCategoryId', '10');
          }

          const targetUrl = `https://www.googleapis.com/youtube/v3/${endpoint}?${params.toString()}`;
          const ytRes = await fetch(targetUrl);
          const data = await ytRes.json();

          if (!ytRes.ok) {
            const isQuota = data?.error?.errors?.some((e: any) => e.reason === 'quotaExceeded');
            res.statusCode = ytRes.status;
            res.end(JSON.stringify({
              error: isQuota ? 'YouTube API daily quota exceeded.' : (data?.error?.message || 'YouTube API error.'),
              code: isQuota ? 'QUOTA_EXCEEDED' : 'API_ERROR',
              details: data?.error
            }));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify(data));
        } catch (error: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            error: 'Failed to communicate with YouTube API',
            message: error?.message || 'Network error',
            code: 'NETWORK_ERROR'
          }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), youtubeApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
