import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
    const session = await auth()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // For now, return empty data since we removed database storage
        // You can implement your own storage solution later
        const mockData = {
            documents: [],
            stats: {
                totalDocuments: 0,
                totalSessions: 0,
                firstDocument: null,
                lastDocument: null
            },
            user: {
                email: session.user.email,
                name: session.user.name
            },
            message: "Database storage removed - implement your own storage solution as needed"
        }

        return NextResponse.json(mockData)
    } catch (error) {
        console.error('Error in documents API:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
