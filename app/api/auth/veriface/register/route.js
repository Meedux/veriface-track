import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Import the similarity functions
function calculateEuclideanSimilarity(descriptor1, descriptor2) {
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
  return 1 / (1 + Math.pow(distance, 1.5));
}

function compareFaceDescriptors(queryDescriptor, storedDescriptors) {
  if (
    Array.isArray(storedDescriptors) &&
    storedDescriptors.length > 0 &&
    Array.isArray(storedDescriptors[0])
  ) {
    const similarities = storedDescriptors.map((desc) =>
      calculateEuclideanSimilarity(queryDescriptor, desc)
    );
    return Math.max(...similarities);
  }
  return calculateEuclideanSimilarity(queryDescriptor, storedDescriptors);
}

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

    // SECURITY IMPROVEMENT: Check if this face is already registered to another user
    const allUsers = await prisma.user.findMany({
      include: {
        faceData: true,
      },
      where: {
        faceData: {
          isNot: null,
        },
        NOT: {
          id: user.id, // Exclude the current user
        },
      },
    });

    // Check for face similarity with existing users
    for (const existingUser of allUsers) {
      if (!existingUser.faceData || !existingUser.faceData.descriptors) continue;

      const similarity = compareFaceDescriptors(
        // For simplicity, check first descriptor of the new face
        Array.isArray(faceDescriptor[0]) ? faceDescriptor[0] : faceDescriptor,
        existingUser.faceData.descriptors
      );

      // If similarity is too high, this face might be already registered
      if (similarity > 0.7) {
        return NextResponse.json(
          { 
            success: false, 
            message: "This face appears similar to an existing user. Please contact support if this is an error."
          },
          { status: 409 }
        );
      }
    }

    // IMPROVEMENT: Validate that the face descriptors actually represent a face
    // by checking for reasonable variance in the descriptors
    if (Array.isArray(faceDescriptor[0])) {
      // Multiple descriptors
      for (const desc of faceDescriptor) {
        if (!isValidFaceDescriptor(desc)) {
          return NextResponse.json(
            { success: false, message: "Invalid face data detected. Please try again with better lighting." },
            { status: 400 }
          );
        }
      }
    } else {
      // Single descriptor
      if (!isValidFaceDescriptor(faceDescriptor)) {
        return NextResponse.json(
          { success: false, message: "Invalid face data detected. Please try again with better lighting." },
          { status: 400 }
        );
      }
    }

    // IMPROVEMENT: Check that the multiple face captures are sufficiently different
    // to ensure good coverage of facial angles
    if (Array.isArray(faceDescriptor[0]) && faceDescriptor.length > 1) {
      let tooSimilar = false;
      
      for (let i = 0; i < faceDescriptor.length; i++) {
        for (let j = i + 1; j < faceDescriptor.length; j++) {
          const similarity = calculateEuclideanSimilarity(
            faceDescriptor[i],
            faceDescriptor[j]
          );
          
          // If any two captures are too similar (>0.95), ask for more variation
          if (similarity > 0.95) {
            tooSimilar = true;
            break;
          }
        }
        if (tooSimilar) break;
      }
      
      if (tooSimilar) {
        return NextResponse.json(
          { success: false, message: "Face captures are too similar. Please move your head to different angles for each capture." },
          { status: 400 }
        );
      }
    }

    // Create date object explicitly for Manila time (GMT+8)
    const now = new Date();
    // Convert to Manila time
    const manilaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const hour = manilaTime.getUTCHours();
    const minute = manilaTime.getUTCMinutes();

    // Format the time for display
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedTime = `${formattedHour}:${minute
      .toString()
      .padStart(2, "0")} ${ampm}`;

    // Determine status based on Manila time
    let status = "present";
    if (hour >= 9) {
      status = "late";
    }

    // Store the Manila date/time in ISO format for consistent database storage
    const manilaDate = manilaTime.toISOString();

    // Create attendance record with Manila time
    await prisma.attendance.create({
      data: {
        userId: user.id,
        date: manilaDate,
        time: formattedTime,
        status: status,
      },
    });

    console.log(
      `Initial attendance logged for ${user.name}: ${status} at ${formattedTime} Manila time`
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

/**
 * Validates that a face descriptor has appropriate statistical properties
 * to be a valid face (and not noise or mistakes)
 */
function isValidFaceDescriptor(descriptor) {
  if (!descriptor || !Array.isArray(descriptor) || descriptor.length < 10) {
    return false;
  }
  
  // Calculate standard deviation - valid face descriptors should have reasonable variance
  const mean = descriptor.reduce((sum, val) => sum + val, 0) / descriptor.length;
  const variance = descriptor.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / descriptor.length;
  const stdDev = Math.sqrt(variance);
  
  // Check if descriptor has reasonable statistical properties
  return stdDev > 0.1 && stdDev < 0.5;
}