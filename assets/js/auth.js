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
  hideLoader,
  redirect
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
        role === USER_ROLES.CUSTOMER ? DEFAULT_CREDIT_LIMIT : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function signUp(name, email, password) {
  showLoader();

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await createUserProfile(credential.user, { name });

    showToast("Account created successfully");
    await redirectByRole();
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  } finally {
    hideLoader();
  }
}

export async function login(email, password) {
  showLoader();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Login successful");
    await redirectByRole();
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  } finally {
    hideLoader();
  }
}

export async function loginWithGoogle() {
  showLoader();

  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    showToast("Google login successful");
    await redirectByRole();
  } catch (error) {
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
    showToast(error.message, "error");
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
  redirect("/login.html");
}

export async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));

  return snapshot.exists() ? snapshot.data() : null;
}

export async function redirectByRole() {
  const profile = await getCurrentUserProfile();

  if (!profile) return;

  if (profile.role === USER_ROLES.ADMIN) {
    redirect("/admin/dashboard.html");
  } else {
    redirect("/customer/home.html");
  }
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}