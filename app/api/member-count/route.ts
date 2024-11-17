import { NextResponse } from 'next/server';

const GUILD_ID = process.env.GUILD_ID;

export async function GET() {
  // Check for missing environment variables
  if (!GUILD_ID) {
    return NextResponse.json(
      { message: 'Missing environment variables' },
      { status: 500 }
    );
  }

  try {
    // Fetch member count from Discord widget endpoint with cache disabled
    const response = await fetch(
      `https://discord.com/api/guilds/${GUILD_ID}/widget.json`,
      {
        cache: 'no-store', // Ensure the request is not cached
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch member count from Discord API: ${response.statusText}`
      );
    }

    const data = await response.json();
    const memberCount = data.member_count;
    const members = data.members;

    console.log('Fetched total member count:', memberCount);
    console.log('Full response:', JSON.stringify(data, null, 2));

    // Return the response with cache-control header to prevent caching
    const res = NextResponse.json({ count: memberCount, members });
    res.headers.set('Cache-Control', 'no-store, must-revalidate'); // Disable caching
    return res;
  } catch (error) {
    console.error('Error fetching member count:', error);
    return NextResponse.json(
      { message: 'Error fetching member count' },
      { status: 500 }
    );
  }
}
