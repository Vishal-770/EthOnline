import { NextRequest, NextResponse } from "next/server";
import { getApiEndpoint } from "@/lib/env";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await context.params; // ✅ await the params

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address" },
        { status: 400 }
      );
    }

    // Fetch from Envio backend
    const envioUrl = getApiEndpoint(`/token-metadata/${address}`);
    const response = await fetch(envioUrl, {
      cache: "no-store", // Disable caching for real-time data
    });

    if (!response.ok) {
      throw new Error(`Envio API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch token metadata" },
      { status: 500 }
    );
  }
}
