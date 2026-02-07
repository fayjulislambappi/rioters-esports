import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Tournament from "@/models/Tournament";
import Game from "@/models/Game"; // Ensure Game is registered for population

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            await connectDB();
            const tournaments = await Tournament.find({ status: { $ne: "COMPLETED" } })
                .populate("gameId", "title")
                .sort({ startDate: 1 });
            return NextResponse.json(tournaments);
        }

        await connectDB();
        const tournaments = await Tournament.find({})
            .populate("gameId", "title")
            .sort({ createdAt: -1 });
        return NextResponse.json(tournaments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectDB();

        const tournament = await Tournament.create(body);
        return NextResponse.json(tournament, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
