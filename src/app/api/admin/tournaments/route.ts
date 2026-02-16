import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Tournament from "@/models/Tournament";
import Game from "@/models/Game";
import Team from "@/models/Team";

export async function GET() {
    try {
        await connectDB();

        // Explicitly reference models to ensure they are registered for population
        // @ts-ignore
        const _models = { Game, Team };

        // Try to get session, but handle failure gracefully for guests
        let session = null;
        try {
            session = await getServerSession(authOptions);
        } catch (e) {
            console.error("Session fetch failed in tournament API:", e);
        }

        // If not admin, only show public tournaments (non-completed)
        if (!session || session.user.role !== "ADMIN") {
            const tournaments = await Tournament.find({
                status: { $in: ["UPCOMING", "ONGOING"] }
            })
                .populate("gameId", "title")
                .sort({ startDate: 1 })
                .lean();

            return NextResponse.json(tournaments);
        }

        // Admin sees everything
        const tournaments = await Tournament.find({})
            .populate("gameId", "title")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(tournaments);
    } catch (error: any) {
        console.error("Tournament GET Error:", error);
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
