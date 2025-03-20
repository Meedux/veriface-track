import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // Get user data and face descriptor
    const { email, faceDescriptor } = await request.json();

    if (!email || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Log the initial attendance (assuming registration counts as attendance)
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Format the time for display
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedTime = `${formattedHour}:${minute
      .toString()
      .padStart(2, "0")} ${ampm}`;

    // Determine status based on time
    let status = "present";
    if (hour >= 9) {
      status = "late";
    }

    // Create attendance record
    await prisma.attendance.create({
      data: {
        userId: user.id,
        date: now,
        time: formattedTime,
        status: status,
      },
    });

    console.log(
      `Initial attendance logged for ${user.name}: ${status} at ${formattedTime}`
    );

    // Update or create face data for the user
    await prisma.faceData.upsert({
      where: { userId: user.id },
      update: { descriptors: faceDescriptor },
      create: {
        descriptors: faceDescriptor,
        userId: user.id,
      },
    });

    // Set user session cookie
    const response = NextResponse.json(
      { success: true, message: "Face registered successfully" },
      { status: 200 }
    );

    // Set a secure HTTP-only cookie with user info
    response.cookies.set({
      name: "user_session",
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error("Face registration error:", error);
    return NextResponse.json(
      { success: false, message: "Error registering face: " + error.message },
      { status: 500 }
    );
  }
}
