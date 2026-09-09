export interface ExtractedMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  artworkUrl?: string;
  format: string;
  size: number;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatBytes(bytes?: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Parses basic ID3v2 tags from an ArrayBuffer
 */
function parseID3v2(buffer: ArrayBuffer): { title?: string; artist?: string; album?: string; artworkUrl?: string } {
  const view = new DataView(buffer);
  if (buffer.byteLength < 10) return {};

  // Check for 'ID3' marker
  if (view.getUint8(0) !== 0x49 || view.getUint8(1) !== 0x44 || view.getUint8(2) !== 0x33) {
    return {};
  }

  const version = view.getUint8(3);
  const isSynchsafe = (val: number) =>
    ((val & 0x7f000000) >> 3) | ((val & 0x007f0000) >> 2) | ((val & 0x00007f00) >> 1) | (val & 0x0000007f);

  const tagSize = isSynchsafe(view.getUint32(6));
  const maxOffset = Math.min(buffer.byteLength, 10 + tagSize);

  const result: { title?: string; artist?: string; album?: string; artworkUrl?: string } = {};
  let offset = 10;

  while (offset < maxOffset - 10) {
    // Read 4-character frame ID
    let frameID = '';
    for (let i = 0; i < 4; i++) {
      const charCode = view.getUint8(offset + i);
      if (charCode < 32 || charCode > 126) break;
      frameID += String.fromCharCode(charCode);
    }
    if (frameID.length < 4) break;

    const frameSize = version === 4 ? isSynchsafe(view.getUint32(offset + 4)) : view.getUint32(offset + 4);
    if (frameSize <= 0 || offset + 10 + frameSize > maxOffset) break;

    const frameData = new Uint8Array(buffer, offset + 10, frameSize);

    // Text decoding helper (skip 1 byte encoding flag)
    const decodeText = (bytes: Uint8Array) => {
      try {
        const encoding = bytes[0];
        const textBytes = bytes.subarray(1);
        if (encoding === 1 || encoding === 2) {
          // UTF-16
          return new TextDecoder('utf-16').decode(textBytes).replace(/\0+$/, '').trim();
        }
        // ISO-8859-1 or UTF-8
        return new TextDecoder('utf-8').decode(textBytes).replace(/\0+$/, '').trim();
      } catch {
        return '';
      }
    };

    if (frameID === 'TIT2') {
      result.title = decodeText(frameData);
    } else if (frameID === 'TPE1') {
      result.artist = decodeText(frameData);
    } else if (frameID === 'TALB') {
      result.album = decodeText(frameData);
    } else if (frameID === 'APIC' && !result.artworkUrl) {
      try {
        // Parse APIC frame (encoding, mime, pic type, desc, picture data)
        let ptr = 1;
        let mime = '';
        while (ptr < frameData.length && frameData[ptr] !== 0) {
          mime += String.fromCharCode(frameData[ptr]);
          ptr++;
        }
        ptr++; // skip null terminator
        ptr++; // skip picture type byte
        while (ptr < frameData.length && frameData[ptr] !== 0) {
          ptr++; // skip description
        }
        ptr++; // skip description terminator

        if (ptr < frameData.length) {
          const imgBytes = frameData.subarray(ptr);
          const mimeType = mime || 'image/jpeg';
          const blob = new Blob([imgBytes], { type: mimeType });
          result.artworkUrl = URL.createObjectURL(blob);
        }
      } catch (err) {
        console.warn('Could not extract album art from APIC frame:', err);
      }
    }

    offset += 10 + frameSize;
  }

  return result;
}

/**
 * Extracts duration by loading into an Audio element metadata probe
 */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.preload = 'metadata';

    const cleanUp = () => {
      URL.revokeObjectURL(url);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const onLoaded = () => {
      const dur = audio.duration;
      cleanUp();
      resolve(isNaN(dur) ? 180 : dur);
    };

    const onError = () => {
      cleanUp();
      resolve(180); // sensible fallback
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.src = url;

    // Timeout safety
    setTimeout(() => {
      cleanUp();
      resolve(180);
    }, 2500);
  });
}

/**
 * Main parser: processes File and returns complete ExtractedMetadata
 */
export async function extractAudioFileMetadata(file: File): Promise<ExtractedMetadata> {
  let title = '';
  let artist = 'Local Artist';
  let album = 'Local Audio';
  let artworkUrl: string | undefined;

  // Fallback parsing from filename (e.g., "Adele - Hello.mp3" or "01 - Bohemian Rhapsody.mp3")
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const parts = baseName.split(' - ');
  if (parts.length >= 2) {
    artist = parts[0].replace(/^\d+\s*/, '').trim();
    title = parts.slice(1).join(' - ').trim();
  } else {
    title = baseName.replace(/^\d+\s*/, '').trim();
  }

  // Attempt ID3v2 extraction from first 256KB
  try {
    const slice = file.slice(0, 262144);
    const arrayBuffer = await slice.arrayBuffer();
    const id3 = parseID3v2(arrayBuffer);
    if (id3.title && id3.title.length > 0) title = id3.title;
    if (id3.artist && id3.artist.length > 0) artist = id3.artist;
    if (id3.album && id3.album.length > 0) album = id3.album;
    if (id3.artworkUrl) artworkUrl = id3.artworkUrl;
  } catch (e) {
    console.warn('ID3 parsing skipped for file:', file.name, e);
  }

  const duration = await getAudioDuration(file);
  const format = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';

  return {
    title: title || 'Unknown Title',
    artist: artist || 'Unknown Artist',
    album: album || 'Local Files',
    duration,
    artworkUrl,
    format,
    size: file.size
  };
}

export async function parseAudioFileMetadata(file: File): Promise<import('../types/music').Track> {
  const meta = await extractAudioFileMetadata(file);
  const trackId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  return {
    id: trackId,
    title: meta.title,
    artist: meta.artist,
    album: meta.album,
    duration: meta.duration,
    artworkUrl: meta.artworkUrl,
    source: 'local',
    file,
    audioUrl: URL.createObjectURL(file),
    format: meta.format,
    size: meta.size,
    addedAt: Date.now()
  };
}
