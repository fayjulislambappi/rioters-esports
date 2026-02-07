import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        const { slug } = params;
        await connectDB();

        const team = await Team.findOne({ slug })
            .populate("members", "name image role")
            .populate("captainId", "name image");

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json(team);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
