import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";

export async function GET() {
    try {
        await connectDB();
        // Only return APPROVED teams for the public list
        const teams = await Team.find({ status: "APPROVED" }).sort({ createdAt: -1 });
        return NextResponse.json(teams);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
