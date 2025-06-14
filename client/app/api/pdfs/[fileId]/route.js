import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { MongoClient, GridFSBucket, ObjectId } from "mongodb"
import dotenv from 'dotenv'
dotenv.config()

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

        // Verify the PDF belongs to the user and get metadata
        const pdfsCollection = db.collection('pdfs')
        const pdfRecord = await pdfsCollection.findOne({
            file_id: new ObjectId(fileId),
            userId: user._id.toString()
        })

        if (!pdfRecord) {
            return NextResponse.json({ error: "PDF not found or access denied" }, { status: 404 })
        }

        // Get the PDF file from GridFS using the file_id from pdfRecord
        const bucket = new GridFSBucket(db, { bucketName: 'pdfs' })

        try {
            // Create a readable stream from GridFS using file_id from metadata
            const downloadStream = bucket.openDownloadStream(pdfRecord.file_id)

            // Convert stream to buffer
            const chunks = []
            for await (const chunk of downloadStream) {
                chunks.push(chunk)
            }
            const buffer = Buffer.concat(chunks)

            // Ensure filename ends with .pdf
            const filename = pdfRecord.filename.endsWith('.pdf')
                ? pdfRecord.filename
                : `${pdfRecord.filename}.pdf`

            // Return the PDF with appropriate headers
            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Content-Length': buffer.length.toString(),
                },
            })
        } catch (error) {
            console.error('Error streaming PDF:', error)
            return NextResponse.json({ error: "Error retrieving PDF file" }, { status: 500 })
        }

    } catch (error) {
        console.error('Error downloading PDF:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
