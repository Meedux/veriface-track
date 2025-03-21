import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Compare face descriptors with improved accuracy and security
 * @param {Array} queryDescriptor - The descriptor to search for
 * @param {Array|Array[]} storedDescriptors - One or more stored descriptors to compare against
 * @returns {number} Similarity score between 0-1
 */
function compareFaceDescriptors(queryDescriptor, storedDescriptors) {
  // Enhanced method that's more discriminative
  if (
    Array.isArray(storedDescriptors) &&
    storedDescriptors.length > 0 &&
    Array.isArray(storedDescriptors[0])
  ) {
    // Calculate similarities for each descriptor
    const similarities = storedDescriptors.map((desc) =>
      calculateEuclideanSimilarity(queryDescriptor, desc)
    );

    // Take the highest similarity as our main metric
    const maxSimilarity = Math.max(...similarities);
    
    // Make sure at least half of the samples have reasonable similarity
    // This prevents a single good match from overriding multiple bad matches
    const reasonableSimilarityCount = similarities.filter(s => s > 0.7).length;
    const sufficientSamples = reasonableSimilarityCount >= storedDescriptors.length / 2;
    
    if (!sufficientSamples && maxSimilarity < 0.85) {
      // If we don't have enough good matches, reduce the final similarity score
      return maxSimilarity * 0.8;
    }
    
    return maxSimilarity;
  }

  // Single descriptor comparison
  return calculateEuclideanSimilarity(queryDescriptor, storedDescriptors);
}

/**
 * Calculate similarity between two face descriptors using Euclidean distance
 * This is more accurate than simple coefficient calculation
 */
function calculateEuclideanSimilarity(descriptor1, descriptor2) {
  if (
    !descriptor1 ||
    !descriptor2 ||
    descriptor1.length !== descriptor2.length
  ) {
    return 0;
  }

  // Calculate Euclidean distance
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  const distance = Math.sqrt(sum);
  
  // Convert distance to similarity (0-1)
  // Using a steeper curve for better discrimination
  return 1 / (1 + Math.pow(distance, 1.5));
}

/**
 * Calculate similarity using cosine similarity for better accuracy
 * This measures the angle between vectors, which is useful for face descriptors
 */
function calculateCosineSimilarity(descriptor1, descriptor2) {
  if (
    !descriptor1 ||
    !descriptor2 ||
    descriptor1.length !== descriptor2.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < descriptor1.length; i++) {
    dotProduct += descriptor1[i] * descriptor2[i];
    magnitude1 += Math.pow(descriptor1[i], 2);
    magnitude2 += Math.pow(descriptor2[i], 2);
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  // Cosine similarity result (between -1 and 1)
  const similarity = dotProduct / (magnitude1 * magnitude2);
  
  // Normalize to 0-1 range
  return (similarity + 1) / 2;
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
    
    // SECURITY IMPROVEMENT: Increase the threshold from 0.6 to 0.75 for much better security
    const SIMILARITY_THRESHOLD = 0.75; 
    
    // Store all similarities for analysis
    const allSimilarities = [];

    for (const user of usersWithFaceData) {
      if (!user.faceData || !user.faceData.descriptors) continue;

      // IMPROVEMENT: Calculate similarity using both methods and take weighted average
      const euclideanSim = compareFaceDescriptors(
        faceDescriptor,
        user.faceData.descriptors
      );
      
      const cosineSim = calculateCosineSimilarity(
        faceDescriptor,
        // If multiple descriptors, use the first one for cosine
        Array.isArray(user.faceData.descriptors[0]) 
          ? user.faceData.descriptors[0] 
          : user.faceData.descriptors
      );
      
      // Weighted average (favoring Euclidean which tends to be more robust)
      const similarity = (euclideanSim * 0.7) + (cosineSim * 0.3);
      
      // Record this similarity for analysis
      allSimilarities.push({
        email: user.email,
        similarity,
        euclideanSim,
        cosineSim
      });

      if (similarity > SIMILARITY_THRESHOLD && similarity > highestSimilarity) {
        highestSimilarity = similarity;
        matchedUser = user;
      }
    }

    // SECURITY IMPROVEMENT: Check if there are multiple high similarity matches
    // This prevents cases where multiple faces have similar scores
    const highSimilarities = allSimilarities.filter(s => 
      s.similarity > SIMILARITY_THRESHOLD * 0.9 && 
      s.email !== (matchedUser?.email || '')
    );
    
    // If we have high similarities with multiple users, require a higher threshold
    if (highSimilarities.length > 0) {
      // Require a higher threshold when multiple potential matches exist
      if (highestSimilarity < SIMILARITY_THRESHOLD * 1.1) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Face verification requires additional confirmation. Please try again with better lighting." 
          },
          { status: 403 }
        );
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, message: "Face not recognized" },
        { status: 404 }
      );
    }

    // Log detailed verification info for debugging
    console.log(`Face verification successful for ${matchedUser.email}`);
    console.log(`Similarity score: ${highestSimilarity.toFixed(4)}`);
    console.log(`Email matched: ${email === matchedUser.email ? 'Yes' : 'No'}`);

    // Create date object explicitly for Manila time (GMT+8)
    const now = new Date();
    // Convert to Manila time
    const manilaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const hour = manilaTime.getUTCHours();
    const minute = manilaTime.getUTCMinutes();

    // Format the time for display (12-hour format with AM/PM)
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedTime = `${formattedHour}:${minute
      .toString()
      .padStart(2, "0")} ${ampm}`;

    // Determine status based on Manila time
    let status = "present";
    if (hour >= 9) {
      // After 9:00 AM Manila time is considered late
      status = "late";
    }

    // Store the Manila date/time in ISO format for consistent database storage
    const manilaDate = manilaTime.toISOString();

    // Log the attendance with Manila time
    await prisma.attendance.create({
      data: {
        userId: matchedUser.id,
        date: manilaDate, // Store ISO date for database consistency
        time: formattedTime, // Store formatted time for display
        status: status,
      },
    });

    console.log(
      `Attendance logged for ${matchedUser.name}: ${status} at ${formattedTime} Manila time`
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