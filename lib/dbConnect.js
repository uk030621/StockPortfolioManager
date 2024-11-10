// lib/dbConnect.js
import clientPromise from '@/lib/mongodb';

export async function connectToCollection(collectionName) {
    const client = await clientPromise;
    const db = client.db('stock_by_user'); // Database name is constant
    return db.collection(collectionName); // Dynamic collection based on region
}

  