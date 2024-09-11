import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodbuk';

// This route.js accesses the DATABASE 'stock_portfolio' from the MongoDB database.
const MONGODB_DB_NAME = 'stock_portfolio';

// This route.js accesses the COLLECTION 'demosettings' from the MongoDB database.
const COLLECTION_BASELINE_NAME = 'LWJ_UK_settings'; // Change this to connenct with appropriate baseline MongoDB collection.

async function connectToDatabase() {
    const client = await clientPromise;
    return client.db(MONGODB_DB_NAME); // Replace with your database name
}

export async function GET(req) {
    try {
        const db = await connectToDatabase();
        const settings = await db.collection(COLLECTION_BASELINE_NAME).findOne({});
        
        return NextResponse.json({ baselinePortfolioValue: settings?.baselinePortfolioValue || 100000 });
    } catch (error) {
        console.error('Error fetching baseline portfolio value:', error);
        return NextResponse.json({ error: 'Failed to retrieve baseline portfolio value' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const db = await connectToDatabase();
        const { baselinePortfolioValue } = await req.json();

        const result = await db.collection(COLLECTION_BASELINE_NAME).updateOne(
            {},
            { $set: { baselinePortfolioValue } },
            { upsert: true }
        );

        if (result.matchedCount === 0 && result.upsertedCount === 0) {
            return NextResponse.json({ error: 'Failed to update baseline portfolio value' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Baseline portfolio value updated successfully' });
    } catch (error) {
        console.error('Error updating baseline portfolio value:', error);
        return NextResponse.json({ error: 'Failed to update baseline portfolio value' }, { status: 500 });
    }
}
