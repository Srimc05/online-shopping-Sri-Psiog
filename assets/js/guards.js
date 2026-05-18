

import { auth } from "./firebase-config.js";
import { getCurrentUserProfile } from "./auth.js";

function waitForAuth() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}


export async function requireRole(expectedRole) {
  const user = await waitForAuth();


  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    console.error("User profile not found");
    window.location.href = "../login.html";
    return;
  }


  if (profile.role !== expectedRole) {
    console.error(
      `Access denied. Expected ${expectedRole}, found ${profile.role}`
    );
    window.location.href = "../login.html";
    return;
  }

  return profile;
}