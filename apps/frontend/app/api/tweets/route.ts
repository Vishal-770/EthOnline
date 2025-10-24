import { NextResponse } from "next/server";
import fetchLatestTweets from "@/lib/fetchtweets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tweets = await fetchLatestTweets();

    return NextResponse.json({
      tweets: tweets || [],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching tweets:", error);

    return NextResponse.json(
      {
        tweets: [],
        success: false,
        error: "Failed to fetch tweets",
      },
      { status: 500 }
    );
  }
}
