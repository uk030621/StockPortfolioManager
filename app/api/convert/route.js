// app/api/convert/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  const { amount, fromCurrency, toCurrency } = await request.json();

  try {
    // Make the request to Frankfurter.app API
    const response = await axios.get(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
    const result = response.data.rates[toCurrency];

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error fetching data from the API:", error);
    return NextResponse.json({ error: "Failed to fetch conversion rate." }, { status: 500 });
  }
}
