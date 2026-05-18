
import {
  auth,
  db,
  googleProvider,
  serverTimestamp
} from "./firebase-config.js";

import {
  ADMIN_EMAILS,
  USER_ROLES,
  DEFAULT_CREDIT_LIMIT,
  COLLECTIONS
} from "./constants.js";

import {
  showToast,
  showLoader,
  hideLoader
} from "./utils.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

function getRoleByEmail(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase())
    ? USER_ROLES.ADMIN
    : USER_ROLES.CUSTOMER;
}

function redirectTo(path) {
  window.location.href = path;
}

export async function createUserProfile(user, extra = {}) {
  const role = getRoleByEmail(user.email);

  await setDoc(
    doc(db, COLLECTIONS.USERS, user.uid),
    {
      uid: user.uid,
      name: extra.name || user.displayName || "",
      email: user.email,
      role,
      creditLimit:
        role === USER_ROLES.CUSTOMER
          ? DEFAULT_CREDIT_LIMIT
          : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getCurrentUserProfile() {
  const user = auth.currentUser;

  if (!user) return null;

  const snapshot = await getDoc(
    doc(db, COLLECTIONS.USERS, user.uid)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

export async function redirectByRole() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  if (profile.role === USER_ROLES.ADMIN) {
    redirectTo("/admin/dashboard.html");
  } else {
    redirectTo("/customer/home.html");
  }
}

export async function signUp(name, email, password) {
  showLoader();

  try {
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await createUserProfile(credential.user, { name });

    showToast("Account created successfully");

    await redirectByRole();
  } catch (error) {
    console.error("Signup error:", error);
if (error.code === "auth/invalid-credential") {
  showToast("Invalid email or password", "error");
} else {
  showToast(error.message, "error");
}
    throw error;
  } finally {
    hideLoader();
  }
}

export async function login(email, password) {
  showLoader();

  try {
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const snapshot = await getDoc(
      doc(
        db,
        COLLECTIONS.USERS,
        credential.user.uid
      )
    );

    if (!snapshot.exists()) {
      throw new Error("User profile not found");
    }

    const profile = snapshot.data();

    showToast("Login successful");

    if (profile.role === USER_ROLES.ADMIN) {
      redirectTo("/admin/dashboard.html");
    } else {
      redirectTo("/customer/home.html");
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast(error.message, "error");
    throw error;
  } finally {
    hideLoader();
  }
}

export async function loginWithGoogle() {
  showLoader();

  try {
    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    await createUserProfile(result.user);

    const profile = await getCurrentUserProfile();

    showToast("Google login successful");

    if (profile.role === USER_ROLES.ADMIN) {
      redirectTo("/admin/dashboard.html");
    } else {
      redirectTo("/customer/home.html");
    }
  } catch (error) {
    console.error("Google login error:", error);
    showToast(error.message, "error");
    throw error;
  } finally {
    hideLoader();
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Password reset email sent");
  } catch (error) {
    console.error("Reset password error:", error);
    showToast(error.message, "error");
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
  redirectTo("/login.html");
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}