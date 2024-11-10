// /app/api/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 });
  }

  try {
    // Replace with your Yahoo Finance or stock symbol API.
    const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${query}`);
    const data = await response.json();

    // Process and return only relevant data (symbols and names)
    const suggestions = data.quotes.map((item) => ({
      symbol: item.symbol,
      name: item.shortname,
    }));

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
