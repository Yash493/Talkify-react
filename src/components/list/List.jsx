import React from 'react'
import "./list.css"
import ChatList from './Chatlist/ChatList'
import UserInfo from './UserInfo/UserInfo'
const List = () => {
  return (
    <div className='list'>
      <UserInfo/>
      <ChatList/>
    </div>
  )
}

export default List
