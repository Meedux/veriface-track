import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    // Get user data and face descriptor
    const { email, faceDescriptor } = await request.json();
    
    if (!email || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update or create face data for the user
    await prisma.faceData.upsert({
      where: { userId: user.id },
      update: { descriptors: faceDescriptor },
      create: {
        descriptors: faceDescriptor,
        userId: user.id
      }
    });
    
    // Set user session cookie (instead of JWT)
    const response = NextResponse.json(
      { success: true, message: 'Face registered successfully' },
      { status: 200 }
    );
    
    // Set a secure HTTP-only cookie with user info
    response.cookies.set({
      name: 'user_session',
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    return response;
  } catch (error) {
    console.error('Face registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Error registering face: ' + error.message },
      { status: 500 }
    );
  }
}

// Include your sophisticated face comparison functions here
// These are copied from your existing code
/**
 * Compare face descriptors with advanced methods for higher accuracy
 * @param {Array} queryDescriptor - The descriptor to search for
 * @param {Array|Array[]} storedDescriptors - One or more stored descriptors to compare against
 * @returns {number} Similarity score between 0-1
 */
function compareFaceDescriptors(queryDescriptor, storedDescriptors) {
  // Handle multiple stored descriptors (from different angles/conditions)
  if (Array.isArray(storedDescriptors) && storedDescriptors.length > 0 && Array.isArray(storedDescriptors[0])) {
    // Calculate similarities for each descriptor
    const similarities = storedDescriptors.map(desc => calculateSimilarity(queryDescriptor, desc));
    
    // Use different aggregation techniques for better accuracy
    
    // Method 1: Take the highest similarity (standard approach)
    const maxSimilarity = Math.max(...similarities);
    
    // Method 2: Use average of top 3 matches (more robust to outliers)
    const topThree = similarities.sort((a, b) => b - a).slice(0, Math.min(3, similarities.length));
    const avgTopThree = topThree.reduce((sum, val) => sum + val, 0) / topThree.length;
    
    // Method 3: Weighted average based on similarity scores
    const sum = similarities.reduce((acc, sim) => acc + sim, 0);
    const weightedAvg = similarities.reduce((acc, sim) => acc + (sim * sim), 0) / (sum || 1);
    
    // Final similarity: weighted combination of different methods
    return (0.5 * maxSimilarity) + (0.3 * avgTopThree) + (0.2 * weightedAvg);
  }
  
  // Single descriptor comparison
  return calculateSimilarity(queryDescriptor, storedDescriptors);
}

/**
 * Calculate similarity between two face descriptors using multiple metrics
 * @param {Array} descriptor1 - First face descriptor
 * @param {Array} descriptor2 - Second face descriptor
 * @returns {number} Similarity score between 0-1
 */
function calculateSimilarity(descriptor1, descriptor2) {
  // Your existing implementation...
  // Ensure descriptors are valid
  if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
    return 0;
  }
  
  // Normalize descriptors for more consistent comparison
  const norm1 = normalizeDescriptor(descriptor1);
  const norm2 = normalizeDescriptor(descriptor2);
  
  // Calculate Euclidean distance (classic method)
  let euclideanSum = 0;
  for (let i = 0; i < norm1.length; i++) {
    euclideanSum += Math.pow(norm1[i] - norm2[i], 2);
  }
  const euclideanDistance = Math.sqrt(euclideanSum);
  const euclideanSimilarity = 1 / (1 + euclideanDistance); // Convert to similarity (0-1)
  
  // Calculate cosine similarity (better for high-dimensional data)
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < norm1.length; i++) {
    dotProduct += norm1[i] * norm2[i];
    magnitude1 += Math.pow(norm1[i], 2);
    magnitude2 += Math.pow(norm2[i], 2);
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  const cosineSimilarity = dotProduct / ((magnitude1 * magnitude2) || 1); // Avoid division by zero
  
  // Calculate Manhattan distance (less sensitive to outliers)
  let manhattanSum = 0;
  for (let i = 0; i < norm1.length; i++) {
    manhattanSum += Math.abs(norm1[i] - norm2[i]);
  }
  const manhattanSimilarity = 1 / (1 + manhattanSum / norm1.length);
  
  // Weight regions of the descriptor differently (face-api.js descriptors have certain regions
  // that correspond to more important facial features)
  // This is a simplification - in a real implementation you'd map the descriptor indices to actual features
  const weightedSimilarity = calculateWeightedRegionSimilarity(norm1, norm2);
  
  // Combine different similarity metrics (with empirically determined weights)
  return (0.35 * cosineSimilarity) + 
         (0.25 * euclideanSimilarity) + 
         (0.15 * manhattanSimilarity) + 
         (0.25 * weightedSimilarity);
}

/**
 * Normalize a descriptor to improve comparison consistency
 * @param {Array} descriptor - Face descriptor to normalize
 * @returns {Array} Normalized descriptor
 */
function normalizeDescriptor(descriptor) {
  // Your existing implementation...
  // Calculate mean and standard deviation
  const mean = descriptor.reduce((sum, val) => sum + val, 0) / descriptor.length;
  
  let variance = 0;
  for (let i = 0; i < descriptor.length; i++) {
    variance += Math.pow(descriptor[i] - mean, 2);
  }
  const stdDev = Math.sqrt(variance / descriptor.length);
  
  // Z-score normalization (if std dev is not zero)
  if (stdDev > 0) {
    return descriptor.map(val => (val - mean) / stdDev);
  }
  
  return descriptor; // Return original if stdDev is 0
}

/**
 * Calculate similarity with different weights for different facial regions
 * @param {Array} desc1 - First normalized face descriptor
 * @param {Array} desc2 - Second normalized face descriptor
 * @returns {number} Weighted similarity score between 0-1
 */
function calculateWeightedRegionSimilarity(desc1, desc2) {
  // Your existing implementation...
  // A very rough approximation of facial regions in a 128-length descriptor
  // In practice, you'd need to identify which indices correspond to which facial features
  const regions = [
    { start: 0, end: 32, weight: 0.4 },   // Eyes and eyebrows region (highest weight)
    { start: 32, end: 64, weight: 0.3 },  // Nose region
    { start: 64, end: 96, weight: 0.2 },  // Mouth and chin region
    { start: 96, end: 128, weight: 0.1 }  // Other features
  ];
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const region of regions) {
    let regionSimilarity = 0;
    
    for (let i = region.start; i < region.end && i < desc1.length; i++) {
      regionSimilarity += Math.pow(desc1[i] - desc2[i], 2);
    }
    
    // Convert distance to similarity
    regionSimilarity = 1 / (1 + Math.sqrt(regionSimilarity));
    
    weightedSum += regionSimilarity * region.weight;
    totalWeight += region.weight;
  }
  
  return weightedSum / totalWeight;
}