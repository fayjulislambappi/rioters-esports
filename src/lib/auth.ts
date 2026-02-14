import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                loginType: { label: "Login Type", type: "text" }, // "admin" or "user"
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                await connectDB();

                // Search by email OR name (username)
                const user = await User.findOne({
                    $or: [
                        { email: credentials.email },
                        { name: credentials.email }
                    ]
                }).select("+password");

                if (!user) {
                    throw new Error("Invalid credentials");
                }

                if (user.isBanned) {
                    throw new Error("Your account has been banned. Please contact support.");
                }

                const isMatch = await bcrypt.compare(
                    credentials.password,
                    user.password!,
                );

                if (!isMatch) {
                    throw new Error("Invalid credentials");
                }

                const loginType = credentials.loginType;

                if (user.role === "ADMIN") {
                    if (loginType !== "admin") {
                        throw new Error("Admins must use the Admin Login portal.");
                    }
                } else {
                    // Normal user
                    if (loginType === "admin") {
                        throw new Error("Access Denied: Admin privileges required.");
                    }
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role, // Keep for compatibility
                    roles: user.roles || [user.role], // Multi-role support
                    provider: "credentials"
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role;
                token.roles = (user as any).roles;
                token.id = user.id;
            }
            if (account) {
                token.provider = account.provider;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as any;
                session.user.roles = token.roles as any;
                session.user.id = token.id as string;
                session.user.provider = token.provider as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
