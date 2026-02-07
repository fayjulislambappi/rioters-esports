import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Game from "@/models/Game";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDB();
        const games = await Game.find({}).sort({ title: 1 });
        // Map to include defaults if missing in DB
        const sanitizedGames = games.map(g => {
            const obj = g.toObject ? g.toObject() : g;
            return {
                ...obj,
                isFeatured: !!obj.isFeatured,
                active: obj.active !== false // default to true
            };
        });
        return NextResponse.json(sanitizedGames);
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
        console.log("[DEBUG] CREATING NEW GAME WITH BODY:", JSON.stringify(body, null, 2));

        await connectDB();

        // Generate slug from title if not provided
        if (!body.slug && body.title) {
            body.slug = body.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        }

        // Ensure boolean types
        body.isFeatured = !!body.isFeatured;
        body.active = body.active !== false;

        const game = await Game.create(body);
        console.log("[DEBUG] GAME CREATED SUCCESSFULLY:", game._id);

        const gameObj = game.toObject();
        return NextResponse.json({
            ...gameObj,
            isFeatured: !!gameObj.isFeatured,
            active: gameObj.active !== false
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
