import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    try {
        await connectDB();

        const team = await Team.findOne({ slug })
            .populate("members", "name image role roles teams")
            .populate("captainId", "name image");

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json(team);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
