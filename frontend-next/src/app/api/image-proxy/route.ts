
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  // Validate URL is a Google Drive link
  if (!url || !/drive\.google\.com/.test(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    // Convert to direct link format if needed
    const directUrl = convertToDirectLink(url);

    // Fetch the image
    const response = await fetch(directUrl);

    // Check if it's actually an image
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 });
    }

    // Return the image with proper CORS headers
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}

function convertToDirectLink(url: string) {
  // Handle standard Google Drive share URL
  const fileMatch = url.match(/https?:\/\/(www\.)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(view|preview)(\?.*)?/);
  if (fileMatch && fileMatch[2]) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[2]}`;
  }

  // Handle open URL format
  const openMatch = url.match(/https?:\/\/(www\.)?drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch && openMatch[2]) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[2]}`;
  }

  return url; // Return original if no match
}