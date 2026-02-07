import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const settings = await Setting.find({});

        // Convert array to key-value object
        const settingsObj = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json(settingsObj);
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
        const { key, value, settings } = body;

        await connectDB();

        if (settings && typeof settings === 'object') {
            // Batch update
            const results = await Promise.all(
                Object.entries(settings).map(([k, v]) =>
                    Setting.findOneAndUpdate(
                        { key: k },
                        { value: v },
                        { upsert: true, new: true }
                    )
                )
            );
            return NextResponse.json({ success: true, results });
        }

        if (!key) {
            return NextResponse.json({ error: "Key is required" }, { status: 400 });
        }

        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, setting });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
