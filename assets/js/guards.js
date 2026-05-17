// assets/js/guards.js

import { auth } from "./firebase-config.js";
import { getCurrentUserProfile } from "./auth.js";

// Wait until Firebase restores authentication state
function waitForAuth() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Ensure user is logged in and has the expected role
export async function requireRole(expectedRole) {
  const user = await waitForAuth();

  // No authenticated user
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  // Load Firestore profile
  const profile = await getCurrentUserProfile();

  if (!profile) {
    console.error("User profile not found");
    window.location.href = "../login.html";
    return;
  }

  // Role mismatch
  if (profile.role !== expectedRole) {
    console.error(
      `Access denied. Expected ${expectedRole}, found ${profile.role}`
    );
    window.location.href = "../login.html";
    return;
  }

  return profile;
}