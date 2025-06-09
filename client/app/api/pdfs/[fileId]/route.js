import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { MongoClient, GridFSBucket, ObjectId } from "mongodb"

const MONGO_URI = process.env.NEXT_PUBLIC_MONGO_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.NEXT_PUBLIC_MONGO_DB_NAME || "skill-burner"

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
        const { fileId } = params

        if (!fileId) {
            return NextResponse.json({ error: "File ID is required" }, { status: 400 })
        }

        const client = await connectToMongoDB()
        const db = client.db(DB_NAME)

        // Get user ID from MongoDB users collection
        const usersCollection = db.collection('users')
        const user = await usersCollection.findOne({ email: session.user.email })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Verify the PDF belongs to the user
        const pdfsCollection = db.collection('pdfs')
        const pdfRecord = await pdfsCollection.findOne({
            file_id: new ObjectId(fileId),
            userId: user._id.toString()
        })

        if (!pdfRecord) {
            return NextResponse.json({ error: "PDF not found or access denied" }, { status: 404 })
        }

        // Get the PDF file from GridFS
        const bucket = new GridFSBucket(db, { bucketName: 'pdfs' })

        // Check if file exists in GridFS
        const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray()
        if (files.length === 0) {
            return NextResponse.json({ error: "PDF file not found in storage" }, { status: 404 })
        }

        const file = files[0]

        // Create a readable stream from GridFS
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId))

        // Convert stream to buffer
        const chunks = []
        for await (const chunk of downloadStream) {
            chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)

        // Return the PDF with appropriate headers
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${pdfRecord.filename}"`,
                'Content-Length': buffer.length.toString(),
            },
        })

    } catch (error) {
        console.error('Error downloading PDF:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
