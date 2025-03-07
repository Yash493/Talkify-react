import { create } from 'zustand';
import { db } from './firebase';
import { doc, getDoc } from "firebase/firestore";
import useUserStore from './userStore';

export const useChatStore = create((set) => ({
  chatId:null,
  user:null,
  isCurrentUserBlocked:false,
  isReceiverBlocked:false,


  changeChat:(chatId,user)=>{
    const currentUser=useUserStore.getState().currentUser



    //check if current user in blocked
    if(user.blocked.includes(currentUser.id)){
      return set({
        chatId,
        user,
        isCurrentUserBlocked:true,
         isReceiverBlocked:false,
      });
    }
else if(currentUser.blocked.includes(user.id)){
      return set({
        chatId,
        user,
        isCurrentUserBlocked:true,
         isReceiverBlocked:false,
      });
    }else{
      set({
        chatId,
        user,
        isCurrentUserBlocked:false,
         isReceiverBlocked:false,
      });
    }



   
  },




    changeBlock:()=>{
      set((state)=>({
        ...state,isReceiverBlocked:!state.isReceiverBlocked
      }));

    },
  }));

export default useUserStore;
