import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            const products = await Product.find({ active: true }).sort({ createdAt: -1 });
            return NextResponse.json(products);
        }

        const products = await Product.find({}).sort({ createdAt: -1 });
        return NextResponse.json(products);
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
            body.slug = body.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        }

        // Fix potential NaN in price
        if (body.price !== undefined) {
            body.price = parseFloat(body.price) || 0;
        }

        // Strip any IDs that might have been copied/submitted
        if (body.optionGroups) {
            body.optionGroups = body.optionGroups.map((group: any) => {
                const { _id, ...groupData } = group;
                if (groupData.options) {
                    groupData.options = groupData.options.map((opt: any) => {
                        const { _id, ...optData } = opt;
                        return optData;
                    });
                }
                return groupData;
            });
        }

        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        console.error("POST Error:", error);
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
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        await connectDB();
        await Product.findByIdAndDelete(id);

        return NextResponse.json({ message: "Product deleted successfully" });
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
        const { id, _id, ...updateData } = body;
        const targetId = id || _id;

        if (!targetId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        // Fix potential NaN in price
        if (updateData.price !== undefined) {
            updateData.price = parseFloat(updateData.price) || 0;
        }

        await connectDB();

        // Strip _ids from nested optionGroups to avoid potential Mongo conflicts
        if (updateData.optionGroups) {
            updateData.optionGroups = updateData.optionGroups.map((group: any) => {
                const { _id, ...groupData } = group;
                if (groupData.options) {
                    groupData.options = groupData.options.map((opt: any) => {
                        const { _id, ...optData } = opt;
                        return optData;
                    });
                }
                return groupData;
            });
        }

        console.log("=== PUT REQUEST ===");
        console.log("ID:", targetId);
        console.log("Option Groups to save:", updateData.optionGroups?.length || 0);

        const product = await Product.findByIdAndUpdate(targetId, updateData, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        console.log("=== SAVED ===");
        console.log("Saved groups:", product.optionGroups?.length || 0);

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error("Consolidated PUT error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
