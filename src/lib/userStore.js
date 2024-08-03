import { create } from 'zustand';
import { db } from './firebase';
import { doc, getDoc } from "firebase/firestore";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  
  fetchUserInfo: async (uid) => {
    if (!uid) {
      set({
        currentUser: null,
        isLoading: false,
      });
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          currentUser: docSnap.data(),
          isLoading: false,
        });
      } else {
        set({
          currentUser: null,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error(err);
      set({
        currentUser: null,
        isLoading: false,
      });
    }
  },
}));

export default useUserStore;
