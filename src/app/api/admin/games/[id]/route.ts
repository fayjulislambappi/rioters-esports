import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Game from "@/models/Game";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const game = await Game.findById(id);

        if (!game) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const gameObj = game.toObject();
        return NextResponse.json({
            ...gameObj,
            isFeatured: !!gameObj.isFeatured,
            active: gameObj.active !== false
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = await params;

        await connectDB();
        const game = await Game.findById(id);

        if (!game) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        // Update fields explicitly to ensure persistence
        if (body.title !== undefined) game.title = body.title;
        if (body.slug !== undefined) game.slug = body.slug;
        if (body.description !== undefined) game.description = body.description;
        if (body.coverImage !== undefined) game.coverImage = body.coverImage;
        if (body.category !== undefined) (game as any).category = body.category;
        if (body.active !== undefined) game.active = body.active;
        if (body.isFeatured !== undefined) game.isFeatured = !!body.isFeatured;

        await game.save();

        const gameObj = game.toObject();
        return NextResponse.json({
            ...gameObj,
            isFeatured: !!gameObj.isFeatured,
            active: gameObj.active !== false
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();
        const game = await Game.findByIdAndDelete(id);

        if (!game) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Game deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
