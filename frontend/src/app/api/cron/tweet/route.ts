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

// Tweet templates - jokey standalone content
const JOKES = [
  "Keir Starmer walks into a bar. He orders a pint, then U-turns and orders water instead. Then U-turns again and leaves.",
  "My sat nav just did a Starmer. Promised to take me home, ended up somewhere completely different, and blamed the previous driver.",
  "Thinking about starting a Keir Starmer diet. You promise to lose weight but then just gain more and blame the last government.",
  "Keir Starmer's promises have a shorter lifespan than a Liz Truss premiership.",
  "Just saw Keir Starmer at a revolving door. He went around 14 times and called each one a 'difficult decision'.",
  "If Keir Starmer was a GPS: 'In 100 meters, make a U-turn. Actually, make one now. Actually, I inherited this route.'",
  "Starmer's commitment to his promises is like my commitment to the gym in January. Strong for about 3 days.",
  "Two Tier Keir: One rule for me accepting freebies, another rule for pensioners keeping their heating on.",
  "Keir Starmer could U-turn in a cul-de-sac.",
  "The only thing Starmer hasn't U-turned on is his ability to U-turn.",
  "Asked Starmer for directions. He said 'follow me' then walked in 6 different directions and charged me for the journey.",
  "Keir Starmer's backbone has been reported missing. Last seen during the election campaign. If found, do not return - he won't recognise it.",
  "Imagine being a Starmer promise. Born in a manifesto, dead by Tuesday.",
  "Starmer treats promises like Tinder matches. Swipes right enthusiastically, ghosts immediately after.",
  "POV: You're a Keir Starmer promise and you see a 'difficult decision' approaching 💀",
  "Keir Starmer's energy policy: Promise green, deliver nothing, blame the weather.",
  "Day 1: Bold promise\nDay 2: Nuanced clarification\nDay 3: That's not what I meant\nDay 4: Actually, the Tories\nDay 5: New bold promise",
  "Starmer said he'd be different. He was right. Usually politicians wait until AFTER the election to disappoint you.",
  "If broken promises were an Olympic sport, Starmer would finally win something for Britain.",
  "Just checked my energy bill. Thanks Keir. Really feeling that 'change' you promised. 🥲",
];

const OBSERVATIONAL = [
  "Remember when 'change' was the slogan? Good times.",
  "The audacity of promising change and then changing nothing except your promises.",
  "Watching Starmer defend his decisions is like watching someone explain why they ate the last biscuit. Poorly.",
  "Somewhere, a Labour manifesto is being used as fiction in a creative writing class.",
  "Friendly reminder that 'difficult decisions' is politician for 'I'm doing the opposite of what I said'.",
  "Another day, another 'we inherited this mess' statement. The political equivalent of 'the dog ate my homework'.",
  "Keir's approval ratings are dropping faster than his promises.",
  "Weird how all those 'fully costed plans' suddenly became 'black holes' after the election. Almost like... no, couldn't be.",
  "If I U-turned at work as much as this government, I'd be fired. Good thing there's no accountability in politics!",
  "It's not a broken promise, it's an 'evolving commitment to pragmatic governance'. Obviously.",
  "Plot twist: The change was the friends we lost along the way.",
  "Winter fuel payments are fine, just put on a jumper. - Someone who accepts free designer clothes",
  "Imagine working class pensioners seeing their heating cut while watching politicians debate which freebie to accept next.",
  "The 'most working-class cabinet ever' sure does love those corporate hospitality boxes.",
  "Keir Starmer: Fighting for working people* \n\n*Terms and conditions apply. Working people does not include pensioners, renters, or anyone expecting promises to be kept.",
];

const SARCASM = [
  "Can't believe people are criticising Starmer. He's done exactly what he said. If you flip the manifesto upside down. And read it backwards. In a mirror.",
  "Give him time! It's only been *checks notes* long enough to break most major promises.",
  "But what about the 14 years of Tories? Checkmate, critics.",
  "To be fair, he never SPECIFICALLY said he'd keep his promises. We just assumed.",
  "The economy will improve any day now. Any day. Just wait. Keep waiting. Still waiting.",
  "Don't worry lads, I'm sure the 'growth' will trickle down any minute now.",
  "Breaking: Government announces new policy. Experts predict U-turn by Thursday.",
  "In Starmer's defence, it's very hard to keep promises when you keep making new ones to break.",
  "Why keep one promise when you can break five? Efficiency.",
  "Sources confirm Keir Starmer has successfully completed a full 360° - he's now facing the original direction but somehow further from the destination.",
];

const SITE_URL = "https://twotierkeir.com";

// Occasional site plugs (only ~20% of tweets)
const SITE_PLUGS = [
  "Tracking every broken promise at {url} 📋",
  "Full accountability tracker: {url}",
];

function getRandomTweet(): string {
  // 80% jokes, 20% site plug
  const allJokes = [...JOKES, ...OBSERVATIONAL, ...SARCASM];

  if (Math.random() < 0.2) {
    // Occasionally plug the site
    const plug = SITE_PLUGS[Math.floor(Math.random() * SITE_PLUGS.length)];
    return plug.replace('{url}', SITE_URL);
  }

  // Pick a random joke
  return allJokes[Math.floor(Math.random() * allJokes.length)];
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
    const tweetText = getRandomTweet();

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
