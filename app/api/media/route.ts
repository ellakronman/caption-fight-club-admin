import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
    try {
        // Always verify authorization before using the service-role client.
        const user = await getAdminUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        if (
            typeof body !== "object" ||
            body === null ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const input = body as Record<string, unknown>;

        const imageUrl = input.image_url;
        const description = input.description;

        if (
            typeof imageUrl !== "string" ||
            imageUrl.trim().length === 0 ||
            imageUrl.length > 2048
        ) {
            return NextResponse.json(
                { error: "A valid image URL is required" },
                { status: 400 }
            );
        }

        let parsedUrl: URL;

        try {
            parsedUrl = new URL(imageUrl.trim());
        } catch {
            return NextResponse.json(
                { error: "Invalid image URL" },
                { status: 400 }
            );
        }

        if (
            parsedUrl.protocol !== "https:" &&
            parsedUrl.protocol !== "http:"
        ) {
            return NextResponse.json(
                { error: "Image URL must use HTTP or HTTPS" },
                { status: 400 }
            );
        }

        if (
            description !== null &&
            description !== undefined &&
            typeof description !== "string"
        ) {
            return NextResponse.json(
                { error: "Invalid description" },
                { status: 400 }
            );
        }

        const cleanDescription =
            typeof description === "string"
                ? description.trim()
                : "";

        if (cleanDescription.length > 1000) {
            return NextResponse.json(
                { error: "Description must be under 1000 characters" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("images")
            .insert({
                user_id: user.id,
                image_url: parsedUrl.toString(),
                description: cleanDescription || null,
            })
            .select("id, user_id, image_url, description, created_at")
            .single();

        if (error) {
            console.error("Create media error:", error);

            return NextResponse.json(
                { error: "Failed to create image" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { image: data },
            { status: 201 }
        );
    } catch (error) {
        console.error("Unexpected create media error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}