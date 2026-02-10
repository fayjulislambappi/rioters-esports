import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        await connectDB();

        // Try finding by slug first, then by ID as fallback
        const isId = slug.match(/^[0-9a-fA-F]{24}$/);
        const query = isId ? { $or: [{ slug }, { _id: slug }] } : { slug };

        const product = await Product.findOne({ ...query, active: true });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
