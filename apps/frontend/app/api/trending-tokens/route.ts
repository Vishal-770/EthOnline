import { NextRequest, NextResponse } from "next/server";
import { getApiEndpoint } from "@/lib/env";

export async function GET(request: NextRequest) {
  try {
    // Fetch trending token addresses from Envio backend
    const envioUrl = getApiEndpoint("/token-addresses");
    const response = await fetch(envioUrl, {
      cache: "no-store", // Disable caching for real-time data
    });

    if (!response.ok) {
      throw new Error(`Envio API returned ${response.status}`);
    }

    const tokenAddresses = await response.json();

    // Fetch metadata for each token sequentially to avoid rate limiting
    const tokensWithMetadata = [];
    const limit = Math.min(tokenAddresses.length, 25); // Fetch up to 25 tokens

    for (let i = 0; i < limit; i++) {
      const address = tokenAddresses[i].address;

      try {
        const metadataResponse = await fetch(
          getApiEndpoint(`/token-metadata/${address}`),
          { cache: "no-store" }
        );

        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json();
          tokensWithMetadata.push({
            ...metadata,
            rank: i + 1,
          });
        }

        // Add a small delay to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to fetch metadata for ${address}:`, error);
      }
    }

    return NextResponse.json(tokensWithMetadata);
  } catch (error) {
    console.error("Error fetching trending tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending tokens" },
      { status: 500 }
    );
  }
}
