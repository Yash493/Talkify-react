import React, { useEffect, useState } from 'react';
import './ChatList.css';
import AddUser from './addUser/Adduser';
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  const [input, setInput] = useState("");

  const fetchChats = async () => {
    if (!currentUser?.id) return;

    const docRef = doc(db, "userchats", currentUser.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      setChats([]);
      return;
    }

    const data = docSnap.data();
    if (!data || !data.chats) {
      setChats([]);
      return;
    }

    const items = data.chats;
    const promises = items.map(async (item) => {
      const userDocRef = doc(db, "users", item.receiverId);
      const userDocSnap = await getDoc(userDocRef);
      return { ...item, user: userDocSnap.data() };
    });

    const chatData = await Promise.all(promises);
    setChats(chatData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  };

  useEffect(() => {
    fetchChats();
  }, [currentUser?.id]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      await fetchChats();
    });

    return () => unSub();
  }, [currentUser.id]);

  const handleAddUserSuccess = () => {
    setAddMode(false);
    fetchChats(); // Refresh the chat list after adding a user
  };

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter(c => 
    c.user?.username && c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="search icon" />
          <input 
            type="text" 
            placeholder='search'  
            value={input}
            onChange={(e) => setInput(e.target.value)} 
          />
        </div>
        <img 
          src={addMode ? "./minus.png" : "./plus.png"} 
          alt={addMode ? "minus icon" : "plus icon"} 
          className='add'
          onClick={() => setAddMode((prev) => !prev)} 
        />
      </div>
      {filteredChats.map((chat) => (
        <div 
          className="item" 
          key={chat.chatId} 
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img 
            src={
              chat.user?.blocked?.includes(currentUser.id) 
                ? "./avatar.png" 
                : chat.user?.avatar || "./avatar.png"
            } 
            alt="" 
          />
          <div className="texts">
            <span>
              {chat.user?.blocked?.includes(currentUser.id)
                ? "user"
                : chat.user?.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser onSuccess={handleAddUserSuccess} />}
    </div>
  );
};

export default ChatList;
