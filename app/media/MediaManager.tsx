"use client";

import { useState } from "react";
import { ImageIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Media = {
    id: string;
    user_id: string;
    image_url: string;
    description: string | null;
    created_at: string;
};

export default function MediaManager({ images }: { images: Media[] }) {
    const router = useRouter();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingImage, setEditingImage] = useState<Media | null>(null);

    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    function resetForm() {
        setShowCreateForm(false);
        setEditingImage(null);
        setImageUrl("");
        setDescription("");
        setError(null);
    }

    function startEditing(image: Media) {
        setEditingImage(image);
        setShowCreateForm(false);
        setImageUrl(image.image_url);
        setDescription(image.description ?? "");
        setError(null);
        setSuccess(null);
    }

    async function saveImage() {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const editing = editingImage !== null;

            const response = await fetch(
                editing
                    ? `/api/media/${editingImage.id}`
                    : "/api/media",
                {
                    method: editing ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        image_url: imageUrl.trim(),
                        description: description.trim() || null,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to save image");
            }

            resetForm();
            setSuccess(
                editing
                    ? "Image updated successfully."
                    : "Image created successfully."
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    async function deleteImage(image: Media) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this image?\n\n" +
            "WARNING: All captions and votes associated with this image " +
            "will also be permanently deleted.\n\n" +
            "This action cannot be undone."
        );

        if (!confirmed) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/media/${image.id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to delete image");
            }

            setSuccess("Image deleted successfully.");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        Image Library
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                        {images.length} images in your database
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setSuccess(null);
                        setShowCreateForm(true);
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
                >
                    <Plus size={17} />
                    Add Image
                </button>
            </div>

            {error && (
                <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {success && (
                <div role="status" className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                    {success}
                </div>
            )}

            {(showCreateForm || editingImage) && (
                <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">
                            {editingImage ? "Edit Image" : "Add New Image"}
                        </h3>

                        <button
                            onClick={resetForm}
                            disabled={loading}
                            aria-label="Close form"
                            className="text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            void saveImage();
                        }}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="image-url"
                                className="mb-2 block text-sm font-medium"
                            >
                                Image URL
                            </label>

                            <input
                                id="image-url"
                                type="url"
                                required
                                value={imageUrl}
                                onChange={(event) =>
                                    setImageUrl(event.target.value)
                                }
                                placeholder="https://example.com/image.png"
                                className="w-full rounded-lg border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-white/30"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="image-description"
                                className="mb-2 block text-sm font-medium"
                            >
                                Description
                            </label>

                            <textarea
                                id="image-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                rows={3}
                                placeholder="Describe this image..."
                                className="w-full rounded-lg border border-white/10 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-white/30"
                            />
                        </div>

                        {imageUrl && (
                            <div>
                                <p className="mb-2 text-sm text-gray-400">
                                    Preview
                                </p>

                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt="Image preview"
                                    className="max-h-64 rounded-lg object-contain"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200 disabled:opacity-50"
                        >
                            {loading
                                ? "Saving..."
                                : editingImage
                                    ? "Save Changes"
                                    : "Create Image"}
                        </button>
                    </form>
                </div>
            )}

            {images.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
                    <ImageIcon
                        size={36}
                        className="mx-auto mb-4 text-gray-500"
                    />
                    <p className="text-gray-400">
                        No images yet. Add your first image.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]"
                        >
                            <div className="flex h-56 items-center justify-center bg-black/30">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={image.image_url}
                                    alt={image.description || "AI-generated image"}
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <div className="space-y-4 p-5">
                                <div>
                                    <p className="line-clamp-2 text-sm text-gray-300">
                                        {image.description || "No description"}
                                    </p>

                                    <p className="mt-2 text-xs text-gray-500">
                                        Added{" "}
                                        {new Date(
                                            image.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEditing(image)}
                                        disabled={loading}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
                                    >
                                        <Pencil size={15} />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => void deleteImage(image)}
                                        disabled={loading}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                    >
                                        <Trash2 size={15} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}