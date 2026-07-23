import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const MONGODB_DB_NAME = "stock_by_user";
const COLLECTION_USSTOCK_NAME = "LWJ_UK_stocks";

// Default headers to mimic a browser request to bypass Yahoo Finance restrictions
const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// Helper function to connect to the database
async function connectToDatabase() {
  const client = await clientPromise;
  return client.db(MONGODB_DB_NAME);
}

// Helper function to verify token and extract email
async function getEmailFromToken(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Not authenticated");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.email;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  try {
    // Check if the symbol is '^FTAS' for direct, independent retrieval
    if (symbol === "^FTAS") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
          {
            headers: YAHOO_HEADERS,
            signal: controller.signal,
          },
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Yahoo returned status ${response.status}`);
        }

        const data = await response.json();
        const pricePerShare =
          data?.chart?.result?.[0]?.meta?.regularMarketPrice;

        if (pricePerShare !== undefined) {
          return NextResponse.json({
            symbol,
            pricePerShare: pricePerShare.toFixed(2),
          });
        } else {
          return NextResponse.json(
            { error: `Index data missing for ^FTAS` },
            { status: 500 },
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to retrieve ^FTAS index data" },
          { status: 500 },
        );
      }
    }

    const db = await connectToDatabase();
    const email = await getEmailFromToken(req);

    // --- FETCH SINGLE STOCK BY SYMBOL ---
    if (symbol) {
      const stock = await db
        .collection(COLLECTION_USSTOCK_NAME)
        .findOne({ symbol, email });

      if (!stock) {
        return NextResponse.json(
          { error: `No stock found with symbol: ${symbol}` },
          { status: 404 },
        );
      }

      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
          { headers: YAHOO_HEADERS },
        );

        if (response.ok) {
          const data = await response.json();
          let pricePerShare =
            data?.chart?.result?.[0]?.meta?.regularMarketPrice;

          if (pricePerShare !== undefined) {
            stock.pricePerShare = (pricePerShare / 100).toFixed(2);
            stock.totalValue = (
              pricePerShare * (stock.sharesHeld || 0)
            ).toFixed(2);

            await db.collection(COLLECTION_USSTOCK_NAME).updateOne(
              { symbol, email },
              {
                $set: {
                  pricePerShare: stock.pricePerShare,
                  totalValue: stock.totalValue,
                },
              },
            );
          }
        }
      } catch (err) {
        console.error(`Error updating live price for ${symbol}:`, err.message);
      }

      return NextResponse.json(stock);
    }

    // --- FETCH ALL STOCKS FOR USER ---
    else {
      const stocks = await db
        .collection(COLLECTION_USSTOCK_NAME)
        .find({ email })
        .toArray();

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}`,
              { headers: YAHOO_HEADERS },
            );

            if (response.ok) {
              const data = await response.json();
              let pricePerShare =
                data?.chart?.result?.[0]?.meta?.regularMarketPrice;

              if (pricePerShare !== undefined) {
                stock.pricePerShare = pricePerShare.toFixed(2);
                stock.totalValue = (
                  pricePerShare * (stock.sharesHeld || 0)
                ).toFixed(2);

                await db.collection(COLLECTION_USSTOCK_NAME).updateOne(
                  { symbol: stock.symbol, email },
                  {
                    $set: {
                      pricePerShare: stock.pricePerShare,
                      totalValue: stock.totalValue,
                    },
                  },
                );
              }
            }
          } catch (err) {
            console.error(
              `Failed to fetch live price for ${stock.symbol}:`,
              err.message,
            );
          }
          return stock;
        }),
      );

      return NextResponse.json(updatedStocks);
    }
  } catch (error) {
    console.error("Error in GET /api/ukstock:", error);
    return NextResponse.json(
      { error: "Failed to retrieve stocks from database" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const db = await connectToDatabase();
    const email = await getEmailFromToken(req);
    const newStock = await req.json();
    newStock.email = email;

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${newStock.symbol}`,
      { headers: YAHOO_HEADERS },
    );
    const data = await response.json();
    let pricePerShare = data?.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (pricePerShare === undefined) {
      throw new Error("Failed to fetch stock price");
    }

    newStock.pricePerShare = pricePerShare.toFixed(2);
    newStock.totalValue = (pricePerShare * (newStock.sharesHeld || 0)).toFixed(
      2,
    );

    const result = await db
      .collection(COLLECTION_USSTOCK_NAME)
      .insertOne(newStock);
    const addedStock = { _id: result.insertedId, ...newStock };

    return NextResponse.json(addedStock, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add stock to database" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const db = await connectToDatabase();
    const email = await getEmailFromToken(req);
    const updatedStock = await req.json();
    const { symbol, ...updateData } = updatedStock;

    const result = await db
      .collection(COLLECTION_USSTOCK_NAME)
      .updateOne({ symbol, email }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: `No stock found with symbol: ${symbol}` },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedStock);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update stock in database" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const db = await connectToDatabase();
    const email = await getEmailFromToken(req);
    const { symbol } = await req.json();

    const result = await db
      .collection(COLLECTION_USSTOCK_NAME)
      .deleteOne({ symbol, email });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: `No stock found with symbol: ${symbol}` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: `Stock with symbol ${symbol} deleted successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete stock from database" },
      { status: 500 },
    );
  }
}
