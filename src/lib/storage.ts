
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads a profile image to Firebase Storage.
 * @param userId The ID of the user.
 * @param file The image file to upload.
 * @returns A promise that resolves with the download URL of the uploaded image.
 */
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  // Create a unique file path, e.g., profileImages/userId/originalFileName.ext
  // You might want to add a timestamp or a UUID to the file name to avoid overwriting if names are the same.
  // For simplicity, we'll use the original file name.
  const filePath = `profileImages/${userId}/${file.name}`;
  const storageRef = ref(storage, filePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Image upload failed. Please try again.');
  }
};

/**
 * Deletes a profile image from Firebase Storage.
 * This function is useful if you want to clean up old images, but for simply
 * removing a user's profile picture, setting their photoURL in Firebase Auth to null
 * is usually sufficient for the display logic.
 * @param filePath The full path to the file in Firebase Storage (e.g., profileImages/userId/fileName.jpg).
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteProfileImageByPath = async (filePath: string): Promise<void> => {
  const storageRef = ref(storage, filePath);
  try {
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn('File to delete not found in Firebase Storage:', filePath);
    } else {
      console.error('Error deleting profile image from Firebase Storage:', error);
      // Optionally re-throw or handle as needed
    }
  }
};
