import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import Order from "@/models/Order";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const [totalUsers, activeTournaments, totalTeams, totalRevenueResult] = await Promise.all([
            User.countDocuments(),
            Tournament.countDocuments({ status: { $in: ["UPCOMING", "ONGOING"] } }),
            Team.countDocuments(),
            Order.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ])
        ]);

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                activeTournaments,
                totalTeams,
                totalRevenue: `$${totalRevenue.toLocaleString()}`
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
