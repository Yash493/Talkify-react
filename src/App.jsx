import React, { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detials/Detail"; // Correct the path
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import useUserStore from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import ErrorBoundary from "../src/components/ErrorBoundary"; // Import ErrorBoundary

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <div className='container'>
        {currentUser ? (
          <>
            <List />
            {chatId && <Chat />}
            {chatId && <Detail />}
          </>
        ) : (
          <Login />
        )}
        <Notification />
      </div>
    </ErrorBoundary>
  );
};

export default App;
