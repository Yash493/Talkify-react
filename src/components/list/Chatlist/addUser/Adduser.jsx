import React, { useState } from 'react';
import './addUser.css';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, serverTimestamp, updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import useUserStore from '../../../../lib/userStore';

const AddUser = ({ onSuccess }) => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    try {
      const chatRef = collection(db, "chats");
      const userChatsRef = collection(db, "userchats");
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const timestamp = new Date(); // Use Date object instead of serverTimestamp

      const chatDataForReceiver = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
        updatedAt: timestamp,
      };

      const chatDataForCurrentUser = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: timestamp,
      };

      const userChatDocRef = doc(userChatsRef, user.id);
      const userChatDocSnap = await getDoc(userChatDocRef);

      if (userChatDocSnap.exists()) {
        const existingChats = userChatDocSnap.data().chats || [];
        const updatedChats = [...existingChats, chatDataForReceiver];
        await updateDoc(userChatDocRef, {
          chats: updatedChats,
          updatedAt: timestamp,
        });
      } else {
        await setDoc(userChatDocRef, {
          chats: [chatDataForReceiver],
          updatedAt: timestamp,
        });
      }

      const currentUserChatDocRef = doc(userChatsRef, currentUser.id);
      const currentUserChatDocSnap = await getDoc(currentUserChatDocRef);

      if (currentUserChatDocSnap.exists()) {
        const existingChats = currentUserChatDocSnap.data().chats || [];
        const updatedChats = [...existingChats, chatDataForCurrentUser];
        await updateDoc(currentUserChatDocRef, {
          chats: updatedChats,
          updatedAt: timestamp,
        });
      } else {
        await setDoc(currentUserChatDocRef, {
          chats: [chatDataForCurrentUser],
          updatedAt: timestamp,
        });
      }

      if (onSuccess) onSuccess(); // Close the add user form on success
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder='Username' name='username' />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
