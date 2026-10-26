import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{ id: string }>;
};

function isValidUUID(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value
    );
}

export async function POST(
    _request: NextRequest,
    context: RouteContext
) {
    // Only superadmins can generate captions.
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

    // Find the existing image.
    const { data: image, error: imageError } = await supabase
        .from("images")
        .select("id, image_url, description")
        .eq("id", id)
        .maybeSingle();

    if (imageError) {
        return NextResponse.json(
            { error: "Unable to retrieve image" },
            { status: 500 }
        );
    }

    if (!image) {
        return NextResponse.json(
            { error: "Image not found" },
            { status: 404 }
        );
    }

    // Check whether captions already exist.
    const { count, error: countError } = await supabase
        .from("captions")
        .select("id", { count: "exact", head: true })
        .eq("image_id", id);

    if (countError) {
        return NextResponse.json(
            { error: "Unable to check existing captions" },
            { status: 500 }
        );
    }

    if ((count ?? 0) > 0) {
        return NextResponse.json(
            { error: "This image already has captions." },
            { status: 409 }
        );
    }

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "OpenAI API key is not configured." },
            { status: 500 }
        );
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Use the existing description, or generate one.
        let description = image.description?.trim();

        if (!description) {
            const descriptionResponse = await openai.responses.create({
                model: "gpt-5.4-mini",
                input: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "input_text",
                                text:
                                    "Describe this image clearly and specifically. " +
                                    "Focus on the visible subjects, their actions, " +
                                    "expressions, setting, objects, and any unusual " +
                                    "or potentially humorous details. Do not write " +
                                    "jokes or captions. Return only a factual " +
                                    "description of the image.",
                            },
                            {
                                type: "input_image",
                                image_url: image.image_url,
                                detail: "high",
                            },
                        ],
                    },
                ],
            });

            description = descriptionResponse.output_text.trim();

            if (!description) {
                throw new Error("OpenAI returned an empty description");
            }
        }

        // Generate four funny captions.
        const response = await openai.responses.create({
            model: "gpt-5.4-mini",
            input: `You are writing funny captions for an image.

You cannot see the image. The only information you have about it is this factual description:

${description}

Based ONLY on that description, write exactly 4 distinct, short, funny captions.

Make them feel like internet humor rather than generic image descriptions. Vary the comedic angle between captions. Do not number them and do not include explanations.

Return the captions as exactly four lines, with one caption per line.`,
        });

        const captions = response.output_text
            .split("\n")
            .map((caption) => caption.trim())
            .filter((caption) => caption.length > 0);

        if (captions.length !== 4) {
            return NextResponse.json(
                {
                    error: "OpenAI did not return exactly four captions. Please retry.",
                },
                { status: 502 }
            );
        }

        // Check again before saving.
        const { count: latestCount, error: latestError } = await supabase
            .from("captions")
            .select("id", { count: "exact", head: true })
            .eq("image_id", id);

        if (latestError) {
            throw latestError;
        }

        if ((latestCount ?? 0) > 0) {
            return NextResponse.json(
                { error: "Captions were already generated for this image." },
                { status: 409 }
            );
        }

        // Save captions to the EXISTING image.
        const { error: insertError } = await supabase
            .from("captions")
            .insert(
                captions.map((text) => ({
                    image_id: id,
                    text,
                }))
            );

        if (insertError) {
            throw insertError;
        }

        // Save the image description if it was generated.
        if (!image.description) {
            const { error: updateError } = await supabase
                .from("images")
                .update({ description })
                .eq("id", id);

            if (updateError) {
                console.error(
                    "Could not save image description:",
                    updateError
                );
            }
        }

        return NextResponse.json({
            success: true,
            imageId: id,
            captions,
        });
    } catch (error) {
        console.error("Admin caption generation failed:", error);

        return NextResponse.json(
            {
                error: "Caption generation failed. Please try again.",
            },
            { status: 500 }
        );
    }
}