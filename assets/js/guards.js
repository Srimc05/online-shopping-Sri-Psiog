import { auth } from "./firebase-config.js";
import { getCurrentUserProfile } from "./auth.js";
import { USER_ROLES } from "./constants.js";
import { redirect } from "./utils.js";

export async function requireAuth() {
  if (!auth.currentUser) {
    redirect("/login.html");
  }
}

export async function requireRole(requiredRole) {
  await requireAuth();

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login.html");
    return;
  }

  if (profile.role !== requiredRole) {
    if (profile.role === USER_ROLES.ADMIN) {
      redirect("/admin/dashboard.html");
    } else {
      redirect("/customer/home.html");
    }
  }
}