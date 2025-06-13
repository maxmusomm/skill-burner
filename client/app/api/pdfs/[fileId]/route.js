import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { MongoClient, GridFSBucket, ObjectId } from "mongodb"
import dotenv from 'dotenv'
dotenv.config()

// const MONGO_URI = process.env.NEXT_PUBLIC_MONGO_URI || "mongodb://localhost:27017"
// const DB_NAME = process.env.NEXT_PUBLIC_MONGO_DB_NAME || "skill-burner"
const MONGO_URI = 'mongodb+srv://SkillUp:2iaMEPhsVWs%40Var@skillup.6fx3ja5.mongodb.net/?retryWrites=true&w=majority&appName=SkillUp';
const DB_NAME = process.env.MONGO_DB_NAME || 'SkillUp';

let cachedClient = null

async function connectToMongoDB() {
    if (cachedClient) {
        return cachedClient
    }

    const client = new MongoClient(MONGO_URI)
    await client.connect()
    cachedClient = client
    return client
}

export async function GET(request, { params }) {
    const session = await auth()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const client = await connectToMongoDB()
        const db = client.db(DB_NAME)

        // Fetch all PDFs for the current session
        const pdfsCollection = db.collection('pdfs')
        const pdfs = await pdfsCollection.find({ sessionId: session.id }).toArray()

        if (!pdfs || pdfs.length === 0) {
            return NextResponse.json({ error: "No PDFs found for this session" }, { status: 404 })
        }

        // Return metadata for PDFs
        return NextResponse.json({ pdfs }, { status: 200 })
    } catch (error) {
        console.error('Error fetching PDFs:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
