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
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { fileId } = params;

        if (!fileId) {
            return NextResponse.json({ error: "File ID is required" }, { status: 400 });
        }

        const client = await connectToMongoDB();
        const db = client.db(DB_NAME);

        // Fetch the PDF metadata
        const pdfsCollection = db.collection('pdfs');
        const pdfRecord = await pdfsCollection.findOne({ file_id: new ObjectId(fileId) });

        if (!pdfRecord) {
            console.error(`PDF metadata not found for fileId: ${fileId}`);
            return NextResponse.json({ error: "PDF not found or access denied" }, { status: 404 });
        }

        console.log(`PDF metadata retrieved:`, pdfRecord);

        // Get the PDF file from GridFS
        const bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of downloadStream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        console.log(`PDF file retrieved successfully. Buffer length: ${buffer.length}`);
        console.log(`Buffer content (first 100 bytes):`, buffer.slice(0, 100));

        // Return the PDF with appropriate headers
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': pdfRecord.content_type || 'application/pdf',
                'Content-Disposition': `attachment; filename="${pdfRecord.filename}"`,
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error downloading PDF:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
