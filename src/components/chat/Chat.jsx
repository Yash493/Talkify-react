import React, { useEffect, useRef, useState } from 'react';
import "./chat.css";
import EmojiPicker from 'emoji-picker-react';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import useUserStore, { useChatStore } from '../../lib/chatStore'; 
import upload from '../../lib/upload';

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const [img, setImg] = useState({ file: null, url: "" });
  const endRef = useRef(null);
  const { chatId, user,isCurrentUserBlocked,isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        setChat(res.data());
      });

      return () => {
        unSub();
      };
    }
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSendMessage = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIds = [currentUser.id, user.id];

      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapShot = await getDoc(userChatsRef);

        if (userChatsSnapShot.exists()) {
          const userChatsData = userChatsSnapShot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          if (chatIndex > -1) {
            userChatsData.chats[chatIndex].lastMessage = text || "Sent an image";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (err) {
      console.log("Error sending message:", err);
    }

    // Reset text and image after sending
    setText("");
    setImg({ file: null, url: "" });
  };

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt={user.username} />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{chat?.lastMessage}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone Icon" />
          <img src="./video.png" alt="Video Icon" />
          <img src="./info.png" alt="Info Icon" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div 
           className={message.senderId ===currentUser?.id ? "message own" :"message"} key={message?.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt="Attached" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}

        {img.url && (
          <div className='message own'>
            <div className="texts">
              <img src={img.url} alt="Preview" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Upload" />
          </label>
          <input type="file" id='file' style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" alt="Camera" />
          <img src="./mic.png" alt="Mic" />
        </div>
        <input
          type="text"
          placeholder=
          {
            isCurrentUserBlocked || isReceiverBlocked
            ? "You cananot send message"
            : 'Type a message...'
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt="Emoji"
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className='sendButton' onClick={handleSendMessage} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
