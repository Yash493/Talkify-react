import React from 'react'
import "./UserInfo.css"
import {useUserStore} from "../../../lib/userStore"
const userInfo = () => {
  const {currentUser}=useUserStore()
  return (
    <div className='userInfo'>
      <div className="user">
       <img src={ currentUser.avatar ||"./avatar.png"} alt="" />
       <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">

        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  )
}

export default userInfo
