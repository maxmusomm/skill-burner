import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { MongoClient, GridFSBucket, ObjectId } from "mongodb"

const MONGO_URI = process.env.MONGO_DB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'skill-burner';


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

export async function GET(request) {
    const session = await auth()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('sessionId')

        const client = await connectToMongoDB()
        const db = client.db(DB_NAME)

        // Get user ID from MongoDB users collection
        const usersCollection = db.collection('users')
        const user = await usersCollection.findOne({ email: session.user.email })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Build query filter
        const query = { userId: user._id.toString() }

        // If sessionId is provided, filter by session as well
        if (sessionId) {
            query.sessionId = sessionId
        }

        // Get user's PDFs from the pdfs collection
        const pdfsCollection = db.collection('pdfs')
        const userPdfs = await pdfsCollection.find(query).sort({ upload_date: -1 }).toArray()

        return NextResponse.json({
            success: true,
            pdfs: userPdfs.map(pdf => ({
                id: pdf._id.toString(),
                fileId: pdf.file_id.toString(),
                filename: pdf.filename,
                pdfType: pdf.pdf_type,
                uploadDate: pdf.upload_date,
                contentType: pdf.content_type
            }))
        })
    } catch (error) {
        console.error('Error fetching PDFs:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
