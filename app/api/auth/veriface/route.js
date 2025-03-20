import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Compare face descriptors with advanced methods for higher accuracy
 * @param {Array} queryDescriptor - The descriptor to search for
 * @param {Array|Array[]} storedDescriptors - One or more stored descriptors to compare against
 * @returns {number} Similarity score between 0-1
 */
function compareFaceDescriptors(queryDescriptor, storedDescriptors) {
  // Handle multiple stored descriptors (from different angles/conditions)
  if (
    Array.isArray(storedDescriptors) &&
    storedDescriptors.length > 0 &&
    Array.isArray(storedDescriptors[0])
  ) {
    // Calculate similarities for each descriptor
    const similarities = storedDescriptors.map((desc) =>
      calculateSimilarity(queryDescriptor, desc)
    );

    // Use different aggregation techniques for better accuracy

    // Method 1: Take the highest similarity (standard approach)
    const maxSimilarity = Math.max(...similarities);

    // Method 2: Use average of top 3 matches (more robust to outliers)
    const topThree = similarities
      .sort((a, b) => b - a)
      .slice(0, Math.min(3, similarities.length));
    const avgTopThree =
      topThree.reduce((sum, val) => sum + val, 0) / topThree.length;

    // Method 3: Weighted average based on similarity scores
    const sum = similarities.reduce((acc, sim) => acc + sim, 0);
    const weightedAvg =
      similarities.reduce((acc, sim) => acc + sim * sim, 0) / (sum || 1);

    // Final similarity: weighted combination of different methods
    return 0.5 * maxSimilarity + 0.3 * avgTopThree + 0.2 * weightedAvg;
  }

  // Single descriptor comparison
  return calculateSimilarity(queryDescriptor, storedDescriptors);
}

/**
 * Calculate similarity between two face descriptors
 * @param {Array} descriptor1 - First face descriptor
 * @param {Array} descriptor2 - Second face descriptor
 * @returns {number} Similarity score between 0-1
 */
function calculateSimilarity(descriptor1, descriptor2) {
  if (
    !descriptor1 ||
    !descriptor2 ||
    descriptor1.length !== descriptor2.length
  ) {
    return 0;
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }

  const distance = Math.sqrt(sum);
  // Convert distance to similarity (0-1)
  return 1 / (1 + distance);
}

export async function POST(request) {
  try {
    const { faceDescriptor, email } = await request.json();

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { success: false, message: "Invalid face descriptor data" },
        { status: 400 }
      );
    }

    // Find all users with face data, optionally filtered by email
    const whereClause = {
      faceData: {
        isNot: null,
      }
    };
    
    // If email is provided, use it to filter users
    if (email) {
      whereClause.email = email;
    }

    const usersWithFaceData = await prisma.user.findMany({
      include: {
        faceData: true,
      },
      where: whereClause
    });

    if (!usersWithFaceData.length) {
      return NextResponse.json(
        { success: false, message: email ? "No face data found for this email" : "No registered faces found" },
        { status: 404 }
      );
    }

    // Find matching user with highest similarity
    let matchedUser = null;
    let highestSimilarity = 0;
    const SIMILARITY_THRESHOLD = 0.6; // Adjust as needed

    for (const user of usersWithFaceData) {
      if (!user.faceData || !user.faceData.descriptors) continue;

      // Compare face descriptors
      const similarity = compareFaceDescriptors(
        faceDescriptor,
        user.faceData.descriptors
      );

      if (similarity > SIMILARITY_THRESHOLD && similarity > highestSimilarity) {
        highestSimilarity = similarity;
        matchedUser = user;
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, message: "Face not recognized" },
        { status: 404 }
      );
    }

    // Now that we have a matchedUser, log attendance
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Format the time for display (12-hour format with AM/PM)
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedTime = `${formattedHour}:${minute
      .toString()
      .padStart(2, "0")} ${ampm}`;

    // Determine status based on time (adjust these thresholds as needed)
    let status = "present";
    if (hour >= 9) {
      // After 9:00 AM is considered late
      status = "late";
    }

    // Log the attendance - Now matchedUser exists
    await prisma.attendance.create({
      data: {
        userId: matchedUser.id,
        date: now,
        time: formattedTime,
        status: status,
      },
    });

    console.log(
      `Attendance logged for ${matchedUser.name}: ${status} at ${formattedTime}`
    );

    // Remove password and face data from response
    const { password, faceData, ...userWithoutSensitiveData } = matchedUser;

    // Create a session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Face authenticated successfully",
        user: userWithoutSensitiveData,
      },
      { status: 200 }
    );

    // Set a secure HTTP-only cookie with user info
    response.cookies.set({
      name: "user_session",
      value: JSON.stringify({
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error("Face verification error:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying face: " + error.message },
      { status: 500 }
    );
  }
}