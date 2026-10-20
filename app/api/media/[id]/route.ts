import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
    params: Promise<{ id: string }>;
};

function isValidUUID(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value
    );
}

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const user = await getAdminUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const { id } = await context.params;

        if (!isValidUUID(id)) {
            return NextResponse.json(
                { error: "Invalid image ID" },
                { status: 400 }
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
            .update({
                image_url: parsedUrl.toString(),
                description: cleanDescription || null,
            })
            .eq("id", id)
            .select("id, user_id, image_url, description, created_at")
            .maybeSingle();

        if (error) {
            console.error("Update media error:", error);

            return NextResponse.json(
                { error: "Failed to update image" },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Image not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ image: data });
    } catch (error) {
        console.error("Unexpected update media error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const user = await getAdminUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const { id } = await context.params;

        if (!isValidUUID(id)) {
            return NextResponse.json(
                { error: "Invalid image ID" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Check that the image exists before deleting it.
        const { data: image, error: lookupError } = await supabase
            .from("images")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        if (lookupError) {
            console.error("Media lookup error:", lookupError);

            return NextResponse.json(
                { error: "Failed to find image" },
                { status: 500 }
            );
        }

        if (!image) {
            return NextResponse.json(
                { error: "Image not found" },
                { status: 404 }
            );
        }

        // Deleting the image cascades to its captions and votes
        // according to the database's foreign-key constraints.
        const { error: deleteError } = await supabase
            .from("images")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Delete media error:", deleteError);

            return NextResponse.json(
                { error: "Failed to delete image" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            deletedId: id,
        });
    } catch (error) {
        console.error("Unexpected delete media error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}