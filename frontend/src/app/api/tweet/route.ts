import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

// Lazy initialization to avoid build-time errors
function getTwitterClient() {
  return new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
  });
}

// Tweet templates - snarky commentary on Starmer
const TWEET_TEMPLATES = [
  "🚨 PROMISE TRACKER UPDATE: Another day, another broken promise. Keep up at {url}",
  "📊 The people have spoken. Check the Hall of Shame to see how {topic} is ranking: {url}",
  "🔄 U-turn count update: We've lost track at this point. Full list: {url}",
  "💨 Today's dose of copium from Starmer defenders. Wall of Cope: {url}",
  "📋 Remember when he promised {promise}? Yeah, about that... {url}",
  "🎭 Two Tier Keir strikes again. Track the failures: {url}",
  "⚠️ Disaster Level: HIGH. See what's trending on the Hall of Shame: {url}",
  "🧠 The mental gymnastics required to defend this government... Wall of Cope: {url}",
  "📉 Approval ratings: 📉 Broken promises: 📈 Track it all: {url}",
  "🗳️ Democracy in action - rate the worst decisions: {url}",
];

const TOPICS = [
  "winter fuel payments",
  "the freebies scandal",
  "NHS waiting times",
  "the housing crisis",
  "tax rises",
  "immigration policy",
  "the economy",
  "public services",
];

const PROMISES = [
  "no tax rises for working people",
  "40,000 extra NHS appointments",
  "lower energy bills",
  "end the cost of living crisis",
  "secure borders",
  "get Britain building",
];

const SITE_URL = "https://twotierkeir.com";

function generateTweet(): string {
  const template = TWEET_TEMPLATES[Math.floor(Math.random() * TWEET_TEMPLATES.length)];
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const promise = PROMISES[Math.floor(Math.random() * PROMISES.length)];

  // Pick a random page to link to
  const pages = ['', '/promises', '/tier-list', '/wall-of-cope', '/failures'];
  const page = pages[Math.floor(Math.random() * pages.length)];

  return template
    .replace('{url}', `${SITE_URL}${page}`)
    .replace('{topic}', topic)
    .replace('{promise}', promise);
}

// POST - Send a tweet
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const tweetText = body.text || generateTweet();

    const client = getTwitterClient();
    const { data } = await client.v2.tweet(tweetText);

    return NextResponse.json({
      success: true,
      tweet: data,
      text: tweetText
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    return NextResponse.json(
      { error: 'Failed to post tweet', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Generate a preview (doesn't post)
export async function GET() {
  const tweet = generateTweet();
  return NextResponse.json({ preview: tweet, length: tweet.length });
}
