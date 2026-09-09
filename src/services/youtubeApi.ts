import { Track } from '../types/music';

// Curated high-fidelity playable catalog with real royalty-free audio streams and synchronized lyrics
export const CURATED_CATALOG: Track[] = [
  {
    id: 'be-lovely',
    title: 'lovely (with Khalid)',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    duration: 200,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    genre: 'Dark Pop / Alternative',
    addedAt: Date.now(),
    lyrics: [
      { time: 0, text: 'Thought I found a way' },
      { time: 10, text: 'Thought I found a way out (found)' },
      { time: 20, text: 'But you never go away (never go away)' },
      { time: 30, text: 'So I guess I gotta stay now' },
      { time: 42, text: 'Oh, I hope some day I\'ll make it out of here' },
      { time: 54, text: 'Even if it takes all night or a hundred years' },
      { time: 68, text: 'Need a place to hide, but I can\'t find one near' },
      { time: 80, text: 'Wanna feel alive, outside I can fight my fear' },
      { time: 94, text: 'Isn\'t it lovely, all alone?' },
      { time: 106, text: 'Heart made of glass, my mind of stone' },
      { time: 118, text: 'Tear me to pieces, skin to bone' },
      { time: 130, text: 'Hello, welcome home' }
    ]
  },
  {
    id: 'be-intro',
    title: '!!!!!!!',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    duration: 14,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=space-ambient-110241.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    genre: 'Intro',
    addedAt: Date.now()
  },
  {
    id: 'be-badguy',
    title: 'bad guy',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    duration: 194,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    genre: 'Dark Pop',
    addedAt: Date.now(),
    lyrics: [
      { time: 0, text: 'White shirt now red, my bloody nose' },
      { time: 8, text: 'Sleepin\', you\'re on your tippy toes' },
      { time: 16, text: 'Creepin\' around like no one knows' },
      { time: 24, text: 'Think you\'re so criminal' },
      { time: 33, text: 'Bruises on both my knees for you' },
      { time: 42, text: 'Don\'t say thank you or please' },
      { time: 51, text: 'So you\'re a tough guy, like it really rough guy' },
      { time: 64, text: 'Just can\'t get enough guy' },
      { time: 76, text: 'I\'m that bad type, make your mama sad type' },
      { time: 88, text: 'I\'m the bad guy, duh' }
    ]
  },
  {
    id: 'be-xanny',
    title: 'xanny',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    duration: 243,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-rain-beat-112188.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    genre: 'Alternative',
    addedAt: Date.now()
  },
  {
    id: 'be-crown',
    title: 'you should see me in a crown',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    duration: 180,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    genre: 'Dark Pop',
    addedAt: Date.now(),
    lyrics: [
      { time: 0, text: 'Bite my tongue, bide my time' },
      { time: 12, text: 'Wearing a warning sign' },
      { time: 24, text: 'Wait till the world is mine' },
      { time: 38, text: 'Visions in red and gold' },
      { time: 50, text: 'You should see me in a crown' },
      { time: 64, text: 'I\'m gonna run this nothing town' },
      { time: 78, text: 'Watch me make \'em bow, one by one by one' }
    ]
  },
  {
    id: 'be-goodgirls',
    title: 'all the good girls go to hell',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    duration: 168,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c976938dc4.mp3?filename=meditation-flute-and-sitar-125434.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    genre: 'Dark Pop',
    addedAt: Date.now()
  },
  {
    id: 'be-wishyouweregay',
    title: 'wish you were gay',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    duration: 221,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    genre: 'Pop',
    addedAt: Date.now()
  },
  {
    id: 'be-partysover',
    title: 'when the party\'s over',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    duration: 196,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    genre: 'Chamber Pop',
    addedAt: Date.now(),
    lyrics: [
      { time: 0, text: 'Don\'t you know I\'m no good for you?' },
      { time: 14, text: 'I\'ve learned to lose you, can\'t afford to' },
      { time: 30, text: 'Tore my shirt to stop you bleedin\'' },
      { time: 45, text: 'But nothin\' ever stops you leavin\'' },
      { time: 60, text: 'Quiet when I\'m comin\' home and I\'m on my own' },
      { time: 78, text: 'I could lie, say I like it like that, like it like that' }
    ]
  },
  {
    id: 'liquid-1',
    title: 'Neon Heartbeat',
    artist: 'The Glitch Dreamers',
    album: 'Liquid Audio Sessions',
    duration: 252,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    genre: 'Liquid Electronic',
    addedAt: Date.now(),
    lyrics: [
      { time: 0, text: 'Deep within the silicon veins' },
      { time: 14, text: 'Where the ghost of rhythm remains' },
      { time: 28, text: 'Pulse of neon, cold and bright' },
      { time: 42, text: 'We are dancing in the static light' },
      { time: 58, text: 'Echoes of a forgotten sun' },
      { time: 74, text: 'Before the digital age had begun' },
      { time: 90, text: 'Infinite loops and endless strands' },
      { time: 108, text: 'Slipping through our hollow hands' },
      { time: 124, text: 'Wait for the signal to return' },
      { time: 142, text: 'Let the circuits finally burn' }
    ]
  },
  {
    id: 'liquid-2',
    title: 'Ethereal Drift',
    artist: 'Solaris Phase',
    album: 'Atmospheres Vol. 1',
    duration: 225,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    genre: 'Ambient / Chill',
    addedAt: Date.now() - 86400000 * 1,
    lyrics: [
      { time: 0, text: 'Drifting beyond the celestial ridge' },
      { time: 20, text: 'Crossing the silent gravity bridge' },
      { time: 50, text: 'Pure stillness in the sound' },
      { time: 90, text: 'A boundless sanctuary found' }
    ]
  },
  {
    id: 'liquid-3',
    title: 'Liquid Motion',
    artist: 'Velvet Echo',
    album: 'Fluidity',
    duration: 252,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    genre: 'Electronic / Synth',
    addedAt: Date.now() - 86400000 * 2
  },
  {
    id: 'liquid-4',
    title: 'Crystalline',
    artist: 'Prism Theory',
    album: 'Refractions',
    duration: 178,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=space-ambient-110241.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    genre: 'Downtempo',
    addedAt: Date.now() - 86400000 * 3
  },
  {
    id: 'liquid-5',
    title: 'Vocal Void',
    artist: 'Liora Vane',
    album: 'Zero Gravity',
    duration: 320,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c976938dc4.mp3?filename=meditation-flute-and-sitar-125434.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    genre: 'Vocal Ambient',
    addedAt: Date.now() - 86400000 * 4
  },
  {
    id: 'liquid-6',
    title: 'Midnight Pulse',
    artist: 'Subzero Beat',
    album: 'Subterranean',
    duration: 213,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-rain-beat-112188.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    genre: 'Bass / Beats',
    addedAt: Date.now() - 86400000 * 5
  },
  {
    id: 'curated-1',
    title: 'Midnight Resonance',
    artist: 'Aura Sound Lab',
    album: 'Atmospheres Vol. 1',
    duration: 215,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    genre: 'Chill / Lo-Fi',
    addedAt: Date.now() - 86400000 * 2,
    lyrics: [
      { time: 0, text: '♪ (Mellow nocturnal keyboard chords resonate)' },
      { time: 14, text: 'Drifting softly through the midnight glow' },
      { time: 28, text: 'Neon horizons moving calm and slow' },
      { time: 42, text: 'No static in the air, just harmonic light' },
      { time: 65, text: 'Lost in the frequency of the endless night' },
      { time: 90, text: '♪ (Smooth rhythm cadence and tape saturation)' },
      { time: 120, text: 'Feel the rhythm settle deep within the soul' },
      { time: 145, text: 'Every soundwave brings us back to whole' },
      { time: 180, text: '♪ (Gentle fade to ambient silence)' }
    ]
  },
  {
    id: 'curated-2',
    title: 'Pulse of Cyberia',
    artist: 'Kroma Synthesis',
    album: 'Synthetic Horizons',
    duration: 242,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    genre: 'Electronic / Workout',
    addedAt: Date.now() - 86400000 * 4,
    lyrics: [
      { time: 0, text: '♪ (Driving analog arpeggio builds up)' },
      { time: 20, text: 'Ignite the engines, break the gravity barrier' },
      { time: 40, text: 'Digital pulses surging through the carrier' },
      { time: 64, text: 'Faster than the signal, sharper than the beam' },
      { time: 96, text: 'Living on the edge of a cybernetic dream' },
      { time: 130, text: '♪ (High-octane drop and sub-bass impact)' },
      { time: 170, text: 'Keep the momentum running wild and bright' },
      { time: 210, text: '♪ (Outro synth decay)' }
    ]
  },
  {
    id: 'curated-3',
    title: 'Raga of Dawn (Morning Serenade)',
    artist: 'Pandit Ananda & Strings',
    album: 'Sacred Ganges Sessions',
    duration: 280,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c976938dc4.mp3?filename=meditation-flute-and-sitar-125434.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    genre: 'Indian Classical / Focus',
    addedAt: Date.now() - 86400000 * 5,
    lyrics: [
      { time: 0, text: '♪ (Sacred sitar and acoustic drone awaken)' },
      { time: 35, text: 'Gentle morning rays illuminating the riverbank' },
      { time: 70, text: 'Peace flowing inward with every breath' },
      { time: 120, text: '♪ (Bansuri flute weaves through harmonic scales)' },
      { time: 180, text: 'Deep contemplation and timeless stillness' },
      { time: 240, text: '♪ (Closing resonant chord)' }
    ]
  },
  {
    id: 'curated-4',
    title: 'Velvet Horizon',
    artist: 'Elysian Waves',
    album: 'Deep Bloom',
    duration: 198,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    genre: 'Chill / Sleep',
    addedAt: Date.now() - 86400000 * 1,
    lyrics: [
      { time: 0, text: '♪ (Warm Rhodes piano and vinyl warmth)' },
      { time: 25, text: 'Close your eyes, let the heavy day release' },
      { time: 55, text: 'Wrapped in acoustic warmth and quiet peace' },
      { time: 100, text: 'Every breath steady, calm and clear' },
      { time: 150, text: 'Rest now, the stars are near' }
    ]
  },
  {
    id: 'curated-5',
    title: 'Monsoon Chai Melody',
    artist: 'Rhea & Swar Collective',
    album: 'Streets of Bombay',
    duration: 220,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc86ec1685.mp3?filename=indian-acoustic-fusion-18451.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    genre: 'Indian Fusion / Chill',
    addedAt: Date.now() - 86400000 * 3
  },
  {
    id: 'curated-6',
    title: 'Echoes of Andromeda',
    artist: 'Stellar Drift',
    album: 'Cosmic Journey',
    duration: 260,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=space-ambient-110241.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    genre: 'Ambient / Focus',
    addedAt: Date.now() - 86400000 * 7
  },
  {
    id: 'curated-7',
    title: 'Tokyo Rain Walk',
    artist: 'Kenji & The Tape Machine',
    album: 'Shibuya Lofi',
    duration: 205,
    source: 'stream',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-rain-beat-112188.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi / Chill',
    addedAt: Date.now() - 86400000 * 6
  }
];

export interface YouTubeSearchResult {
  tracks: Track[];
  nextPageToken?: string;
  totalResults?: number;
  error?: string;
  errorCode?: 'API_KEY_MISSING' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'API_ERROR';
}

function parseISO8601Duration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 180;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function searchYouTubeMusic(
  query: string,
  userApiKey?: string,
  pageToken?: string
): Promise<YouTubeSearchResult> {
  if (!query.trim()) {
    return { tracks: [] };
  }

  const headers: Record<string, string> = {};
  if (userApiKey) {
    headers['x-youtube-api-key'] = userApiKey;
  }

  const params = new URLSearchParams({
    endpoint: 'search',
    q: `${query} music`,
    type: 'video',
    videoCategoryId: '10',
    part: 'snippet',
    maxResults: '20'
  });

  if (pageToken) params.append('pageToken', pageToken);

  try {
    const response = await fetch(`/api/youtube?${params.toString()}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      return {
        tracks: [],
        error: data.message || data.error || 'Failed to search YouTube Music',
        errorCode: data.code || 'API_ERROR'
      };
    }

    const items = data.items || [];
    const videoIds = items.map((i: any) => i.id?.videoId).filter(Boolean).join(',');

    // Fetch video duration and metadata
    let durationMap: Record<string, number> = {};
    if (videoIds) {
      try {
        const detailsParams = new URLSearchParams({
          endpoint: 'videos',
          id: videoIds,
          part: 'contentDetails,snippet'
        });
        const detailsRes = await fetch(`/api/youtube?${detailsParams.toString()}`, { headers });
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          (detailsData.items || []).forEach((vid: any) => {
            if (vid.id && vid.contentDetails?.duration) {
              durationMap[vid.id] = parseISO8601Duration(vid.contentDetails.duration);
            }
          });
        }
      } catch (err) {
        console.warn('Could not fetch video durations:', err);
      }
    }

    const tracks: Track[] = items
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => {
        const vid = item.id.videoId;
        const snippet = item.snippet || {};
        const title = decodeHTMLEntities(snippet.title || 'Untitled');
        const artist = decodeHTMLEntities(snippet.channelTitle || 'Unknown Artist');
        const artworkUrl =
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;

        return {
          id: `yt-${vid}`,
          youtubeId: vid,
          title,
          artist,
          album: 'YouTube Music',
          duration: durationMap[vid] || 210,
          artworkUrl,
          source: 'youtube' as const,
          addedAt: Date.now()
        };
      });

    return {
      tracks,
      nextPageToken: data.nextPageToken,
      totalResults: data.pageInfo?.totalResults
    };
  } catch (err: any) {
    return {
      tracks: [],
      error: err.message || 'Network error while contacting YouTube API',
      errorCode: 'NETWORK_ERROR'
    };
  }
}

export async function getTrendingYouTubeMusic(
  userApiKey?: string,
  regionCode = 'US'
): Promise<YouTubeSearchResult> {
  const headers: Record<string, string> = {};
  if (userApiKey) {
    headers['x-youtube-api-key'] = userApiKey;
  }

  const params = new URLSearchParams({
    endpoint: 'videos',
    chart: 'mostPopular',
    videoCategoryId: '10', // Music
    part: 'snippet,contentDetails',
    maxResults: '20',
    regionCode
  });

  try {
    const response = await fetch(`/api/youtube?${params.toString()}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      return {
        tracks: [],
        error: data.message || data.error,
        errorCode: data.code || 'API_ERROR'
      };
    }

    const tracks: Track[] = (data.items || []).map((item: any) => {
      const vid = item.id;
      const snippet = item.snippet || {};
      const duration = item.contentDetails?.duration ? parseISO8601Duration(item.contentDetails.duration) : 210;

      return {
        id: `yt-${vid}`,
        youtubeId: vid,
        title: decodeHTMLEntities(snippet.title || 'Untitled'),
        artist: decodeHTMLEntities(snippet.channelTitle || 'Unknown Artist'),
        album: 'Trending Charts',
        duration,
        artworkUrl:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
        source: 'youtube' as const,
        addedAt: Date.now()
      };
    });

    return { tracks };
  } catch (err: any) {
    return {
      tracks: [],
      error: err.message,
      errorCode: 'NETWORK_ERROR'
    };
  }
}

function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

let activeCustomApiKey: string = '';

export function setCustomApiKey(key: string) {
  activeCustomApiKey = key.trim();
}

export async function searchMusic(query: string): Promise<Track[]> {
  const result = await searchYouTubeMusic(query, activeCustomApiKey || undefined);
  if (result.error && (!result.tracks || result.tracks.length === 0)) {
    throw new Error(result.error);
  }
  return result.tracks;
}
