import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const MONGODB_DB_NAME = "stock_by_user";
const COLLECTION_USSTOCK_NAME = "LWJ_UK_stocks";

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
    // Check if the symbol is 'FTSE^' for direct, independent retrieval of DAX index data
    if (symbol === "^FTSE") {
      //console.log("Fetching FTSE^ index data...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Set 5-second timeout

      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        clearTimeout(timeoutId); // Clear timeout if fetch succeeds

        // Log response for debugging purposes
        //console.log("Received FTSE^ data:", JSON.stringify(data.chart.result[0].meta, null, 2));

        // Retrieve DAX index values directly
        const pricePerShare =
          data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (pricePerShare !== undefined) {
          //console.log(`DAX Index (FTSE^) value: ${indexValue}`);
          return NextResponse.json({
            symbol,
            pricePerShare: pricePerShare.toFixed(2),
          });
        } else {
          //console.error("Index data missing for FTSE^.");
          return NextResponse.json(
            { error: `Index data missing for FTSE^` },
            { status: 500 }
          );
        }
      } catch (error) {
        //console.error("Error fetching FTSE^ data:", error.message || error);
        return NextResponse.json(
          {
            error:
              "Failed to retrieve FTSE^ index data due to timeout or network error",
          },
          { status: 500 }
        );
      }
    }

    //try {
    const db = await connectToDatabase();
    const email = await getEmailFromToken(req);

    if (symbol) {
      const stock = await db
        .collection(COLLECTION_USSTOCK_NAME)
        .findOne({ symbol, email });

      if (!stock) {
        return NextResponse.json(
          { error: `No stock found with symbol: ${symbol}` },
          { status: 404 }
        );
      }

      if (stock.pricePerShare || stock.totalValue) {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
        );
        const data = await response.json();
        let pricePerShare = data.chart.result[0].meta.regularMarketPrice;

        if (pricePerShare !== undefined) {
          stock.pricePerShare = (pricePerShare / 100).toFixed(2);
          stock.totalValue = (pricePerShare * stock.sharesHeld).toFixed(2);
          await db.collection(COLLECTION_USSTOCK_NAME).updateOne(
            { symbol, email },
            {
              $set: {
                pricePerShare: stock.pricePerShare,
                totalValue: stock.totalValue,
              },
            }
          );
        } else {
          return NextResponse.json(
            { error: `Failed to fetch stock price for symbol: ${symbol}` },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(stock);
    } else {
      const stocks = await db
        .collection(COLLECTION_USSTOCK_NAME)
        .find({ email })
        .toArray();

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          if (stock.pricePerShare || stock.totalValue) {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}`
            );
            const data = await response.json();
            let pricePerShare = data.chart.result[0].meta.regularMarketPrice;

            if (pricePerShare !== undefined) {
              stock.pricePerShare = pricePerShare.toFixed(2);
              stock.totalValue = (pricePerShare * stock.sharesHeld).toFixed(2);

              await db.collection(COLLECTION_USSTOCK_NAME).updateOne(
                { symbol: stock.symbol, email },
                {
                  $set: {
                    pricePerShare: stock.pricePerShare,
                    totalValue: stock.totalValue,
                  },
                }
              );
            }
          }
          return stock;
        })
      );

      return NextResponse.json(updatedStocks);
    }
  } catch (error) {
    //console.error('Error fetching stocks from database:', error);
    return NextResponse.json(
      { error: "Failed to retrieve stocks from database" },
      { status: 500 }
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
      `https://query1.finance.yahoo.com/v8/finance/chart/${newStock.symbol}`
    );
    const data = await response.json();
    let pricePerShare = data.chart.result[0].meta.regularMarketPrice;

    if (pricePerShare === undefined) {
      throw new Error("Failed to fetch stock price");
    }

    newStock.pricePerShare = pricePerShare.toFixed(2);
    newStock.totalValue = (pricePerShare * newStock.sharesHeld).toFixed(2);

    const result = await db
      .collection(COLLECTION_USSTOCK_NAME)
      .insertOne(newStock);
    const addedStock = { _id: result.insertedId, ...newStock };

    return NextResponse.json(addedStock, { status: 201 });
  } catch (error) {
    //console.error('Error adding stock to database:', error);
    return NextResponse.json(
      { error: "Failed to add stock to database" },
      { status: 500 }
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
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStock);
  } catch (error) {
    //console.error('Error updating stock in database:', error);
    return NextResponse.json(
      { error: "Failed to update stock in database" },
      { status: 500 }
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
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Stock with symbol ${symbol} deleted successfully`,
    });
  } catch (error) {
    //console.error('Error deleting stock from database:', error);
    return NextResponse.json(
      { error: "Failed to delete stock from database" },
      { status: 500 }
    );
  }
}
