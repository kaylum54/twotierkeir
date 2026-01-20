import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

// Verify this is a legitimate cron request
const CRON_SECRET = process.env.CRON_SECRET;

// Tweet templates - variety of snarky commentary
const MORNING_TWEETS = [
  "Good morning! Another day of holding this government accountable. What fresh disaster awaits? 🫖",
  "☀️ Rise and shine! Time to check if any more promises were broken overnight: {url}/promises",
  "🌅 Morning update: Still tracking every failure, every U-turn, every broken promise. {url}",
];

const AFTERNOON_TWEETS = [
  "📊 Midday check-in: The Hall of Shame is heating up. Cast your vote: {url}/tier-list",
  "🔥 Trending on the failure tracker right now... {url}/failures",
  "💭 Lunchtime thought: Remember when politicians kept their promises? Neither do we. {url}",
];

const EVENING_TWEETS = [
  "📋 Daily roundup: Another day, another set of excuses. Full breakdown: {url}",
  "🌙 Evening reminder: We're still watching. Every promise. Every U-turn. {url}/promises",
  "🧠 End of day cope collection looking strong. See the best mental gymnastics: {url}/wall-of-cope",
];

const GENERAL_TWEETS = [
  "🚨 PROMISE TRACKER: {broken} broken, {pending} pending, {kept}... kept? We'll believe it when we see it. {url}/promises",
  "🎭 Two Tier Keir tracker update. The people are rating the failures: {url}/tier-list",
  "📉 The numbers don't lie. Track every broken promise: {url}",
  "🔄 Lost count of the U-turns yet? Don't worry, we haven't: {url}/promises",
  "💨 Fresh copium alert! See what the defenders are saying: {url}/wall-of-cope",
  "⚠️ Public service announcement: Your government accountability tracker is live 24/7 {url}",
  "🗳️ Democracy means holding them accountable. Do your part: {url}/tier-list",
  "📢 Promises made. Promises broken. All documented: {url}/promises",
  "🎪 Welcome to the circus. Today's performance: {url}/failures",
  "⏰ Tick tock. Still waiting on those promises... {url}",
];

const SITE_URL = "https://twotierkeir.com";

function getTimeBasedTweet(): string {
  const hour = new Date().getUTCHours();

  let templates: string[];

  if (hour >= 6 && hour < 12) {
    templates = [...MORNING_TWEETS, ...GENERAL_TWEETS];
  } else if (hour >= 12 && hour < 18) {
    templates = [...AFTERNOON_TWEETS, ...GENERAL_TWEETS];
  } else {
    templates = [...EVENING_TWEETS, ...GENERAL_TWEETS];
  }

  const template = templates[Math.floor(Math.random() * templates.length)];

  // Mock stats (could fetch from actual API later)
  const broken = Math.floor(Math.random() * 10) + 15;
  const pending = Math.floor(Math.random() * 10) + 5;
  const kept = Math.floor(Math.random() * 3);

  return template
    .replace(/{url}/g, SITE_URL)
    .replace('{broken}', broken.toString())
    .replace('{pending}', pending.toString())
    .replace('{kept}', kept.toString());
}

export async function GET(request: Request) {
  // Verify cron secret if set
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const tweetText = getTimeBasedTweet();

    const { data } = await client.v2.tweet(tweetText);

    return NextResponse.json({
      success: true,
      tweet: data,
      text: tweetText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error posting scheduled tweet:', error);
    return NextResponse.json(
      { error: 'Failed to post tweet', details: String(error) },
      { status: 500 }
    );
  }
}
