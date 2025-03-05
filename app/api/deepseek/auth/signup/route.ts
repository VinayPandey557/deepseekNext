import { NextResponse } from "next/server";
import { signUpSchema } from "./validation";
import { prisma } from "@/db/db";


export async function POST(req: Request) {
    try {
        const body = await req.json();

        const parsedBody = signUpSchema.safeParse(body);
        if(!parsedBody.success){
            return NextResponse.json(
                { error: 'Invalid input', details: parsedBody.error.errors },
                {  status: 400 }
            );
        }

        const { username , password } = parsedBody.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                username
            },
        });


        if(existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 409 }
            );
        }


        const newUser = await prisma.user.create({
            data: {
                username, 
                password
            },
        });

        return NextResponse.json( 
            { message: "User created successfully", user: { id: newUser.id, username: newUser.username } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup Error", error);
        return NextResponse.json({error: "Internal server error"}, { status: 500});
    }
    
}