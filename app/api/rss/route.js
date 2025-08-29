import Parser from "rss-parser";

const parser = new Parser();

export async function GET() {
  try {
    const feed = await parser.parseURL("https://hnrss.org/frontpage"); 
    return new Response(JSON.stringify(feed.items.slice(0, 10)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch RSS" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
