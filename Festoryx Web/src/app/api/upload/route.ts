import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderParam = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate type (images only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate folder parameter to start with allowed roots
    const folder = (folderParam || "festoryx/payment-proofs").trim();
    if (!folder.startsWith("festoryx/") && !folder.startsWith("festoryx/")) {
      return NextResponse.json(
        { error: "Invalid upload directory" },
        { status: 400 }
      );
    }

    const result = await uploadToCloudinary(file, folder);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "File upload failed" },
      { status: 500 }
    );
  }
}
