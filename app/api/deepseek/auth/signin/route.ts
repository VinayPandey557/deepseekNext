import { NextResponse } from "next/server";
import { prisma } from "@/db/db";


export async function POST(req: Request) {
    try {
        const { username , password } = await req.json();

        const user = await prisma.user.findUnique({
            where: { username }
        });
        if(!user) {
            return NextResponse.json({ error: "User not found"}, { status: 401});
        }

        if(user.password !== password) {
            return NextResponse.json({ error: "Invalid Password"},{ status: 401});
        }

        return NextResponse.json({ message: "Sign in successfull", user}, { status: 200 })
    }  catch (error) {
        console.error("Sign-in error", error);
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 });
    }
}