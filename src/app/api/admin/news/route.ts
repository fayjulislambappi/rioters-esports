import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import News from "@/models/News";

export async function GET() {
    try {
        await connectDB();
        const articles = await News.find({}).sort({ createdAt: -1 });
        return NextResponse.json(articles);
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

        if (!body.slug) {
            body.slug = body.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        }

        const article = await News.create(body);
        return NextResponse.json(article, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Article ID required" }, { status: 400 });
        }

        await connectDB();
        await News.findByIdAndDelete(id);

        return NextResponse.json({ message: "Article deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: "Article ID required" }, { status: 400 });
        }

        await connectDB();
        const article = await News.findByIdAndUpdate(id, updateData, { new: true });

        if (!article) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, article });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
