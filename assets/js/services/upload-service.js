import { storage } from "../firebase-config.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

export async function uploadImage(file, folder = "products") {
  const fileName =
    `${Date.now()}-${file.name}`;

  const storageRef = ref(
    storage,
    `${folder}/${fileName}`
  );

  await uploadBytes(storageRef, file);

  return await getDownloadURL(storageRef);
}