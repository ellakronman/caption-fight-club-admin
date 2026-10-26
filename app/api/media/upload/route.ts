import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "caption-fight-club-images";
const MAX_SIZE = 5 * 1024 * 1024;
const MIME_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
]);

export async function POST(request: NextRequest) {
    try {
        const user = await getAdminUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const form = await request.formData();
        const file = form.get("file");
        const description = form.get("description");
        if (!(file instanceof File) || !MIME_TYPES.has(file.type) || file.size === 0 || file.size > MAX_SIZE) {
            return NextResponse.json({ error: "Select a JPEG, PNG, or WebP image up to 5 MB." }, { status: 400 });
        }
        if (description !== null && (typeof description !== "string" || description.length > 1000)) {
            return NextResponse.json({ error: "Description must be under 1000 characters." }, { status: 400 });
        }

        // Check magic bytes, not just the browser-provided MIME type.
        const bytes = new Uint8Array(await file.arrayBuffer());
        const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
        const png = bytes.slice(0, 8).every((b, i) => b === [137,80,78,71,13,10,26,10][i]);
        const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
        if (!((file.type === "image/jpeg" && jpeg) || (file.type === "image/png" && png) || (file.type === "image/webp" && webp))) {
            return NextResponse.json({ error: "File content does not match its image type." }, { status: 400 });
        }

        const supabase = createAdminClient();
        const key = `${user.id}/${randomUUID()}.${MIME_TYPES.get(file.type)}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(key, bytes, {
            contentType: file.type,
            upsert: false,
        });
        if (uploadError) {
            console.error("Admin image upload failed:", uploadError.message);
            return NextResponse.json({ error: "Storage upload failed. Check that the image bucket exists." }, { status: 500 });
        }

        const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(key);
        const { data: image, error: insertError } = await supabase.from("images").insert({
            user_id: user.id,
            image_url: publicUrl.publicUrl,
            description: typeof description === "string" ? description.trim() || null : null,
        }).select("id, user_id, image_url, description, created_at").single();
        if (insertError) {
            const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([key]);
            if (cleanupError) console.error("Orphan cleanup failed:", key, cleanupError.message);
            console.error("Image record insert failed:", insertError.message);
            return NextResponse.json({ error: "Could not save image record; uploaded file cleanup attempted." }, { status: 500 });
        }
        return NextResponse.json({ image }, { status: 201 });
    } catch (error) {
        console.error("Unexpected image upload error:", error);
        return NextResponse.json({ error: "Unable to upload image." }, { status: 500 });
    }
}
