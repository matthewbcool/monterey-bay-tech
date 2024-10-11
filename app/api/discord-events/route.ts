import { NextResponse } from 'next/server';
interface EventEntityMetadata {
  location?: string; // Optional, relevant for EXTERNAL events
}

interface Event {
  id: string; // Event ID (snowflake)
  guild_id: string; // Guild (Server) ID (snowflake)
  channel_id?: string | null; // Channel ID (optional, nullable for EXTERNAL events)
  creator_id?: string | null; // ID of the user who created the event
  name: string; // Event name (1-100 characters)
  description?: string; // Event description (optional)
  scheduled_start_time: string; // ISO8601 timestamp for the start time
  scheduled_end_time?: string; // ISO8601 timestamp for the end time (optional)
  privacy_level: number; // Privacy level (GUILD_ONLY = 2)
  status: number; // Event status (SCHEDULED = 1, ACTIVE = 2, COMPLETED = 3, CANCELED = 4)
  entity_type: number; // Entity type (STAGE_INSTANCE = 1, VOICE = 2, EXTERNAL = 3)
  entity_id?: string; // Entity ID associated with the event
  entity_metadata?: EventEntityMetadata; // Additional metadata (optional)
  creator?: {
    // Creator information (optional)
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
  user_count?: number; // Number of users subscribed (optional)
  image?: string;
  event: any; // Cover image hash (optional)
}

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

export async function GET() {
  // Check for missing environment variables
  if (!DISCORD_BOT_TOKEN || !GUILD_ID) {
    return NextResponse.json(
      { message: 'Missing environment variables' },
      { status: 500 }
    );
  }

  try {
    // Fetch events from Discord with cache disabled
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`,
      {
        cache: 'no-store', // Ensure the request is not cached
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch events from Discord API: ${response.statusText}`
      );
    }

    const events = await response.json();
    console.log('Fetched Events:', events); // Log for debugging

    // Return the response with cache-control header to prevent caching
    const res = NextResponse.json(events);
    res.headers.set('Cache-Control', 'no-store, must-revalidate'); // Disable caching
    return res;
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Error fetching events' },
      { status: 500 }
    );
  }
}
