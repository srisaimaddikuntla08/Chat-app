
import { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../ChatContext'
import { AuthContext } from '../../AuthContext'
import { toast} from 'react-hot-toast' 
function ChatContainer() {

  const {messages,selectedUser,setSelectedUser,sendMessages,getMessages} = useContext(ChatContext)
  const {authUser,onlineUsers} = useContext(AuthContext)

  const scrollEnd = useRef()

  const[input,setInput] = useState("")


// function to handleSendMessage
  const handleSendMesage = async(e)=>{
      e.preventDefault();
      if(input.trim()=== "") return null;
      await sendMessages({text:input.trim()})
      setInput("")
  }
  // function to handlesemdImage

   const handleSendImage = async(e)=>{
      const file = e.target.file[0]
      if(!file||!file.type.startsWith("image/")){
        toast.error("select an imae file")
        return;
      } 
      const reader = new FileReader();
      reader.onload = async ()=>{
        await sendMessage({image:reader.result})
      }
        reader.readAsDataURL(file)
        e.target.value = ""
  }

  useEffect(() => {
    if(selectedUser){
      getMessages(selectedUser._id);
    }
    
  }, [selectedUser]); 

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // Ensure that messagesDummyData changes trigger the scroll.

  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/* header part */}
      <div className=' flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8  rounded-full ' />
        {/* <p className='flex-1 text-lg text-white flex items-center gap-2'>{selectedUser.fullName} <span className='w-2 h-2 rounded-full bg-green-500'>{onlineUsers.includes(selectedUser._id) &&</span>}</p> */}
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
  {selectedUser.fullName}
  {onlineUsers.includes(selectedUser._id) && (
    <span className='w-2 h-2 rounded-full bg-green-500'></span>
  )}
</p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7' />
        <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5' />
      </div>

      {/* chat area */}

     
<div className='flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6'>
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 justify-end 
        ${msg.senderId !== authUser._id && "flex-row-reverse"}`}>
            {msg.image ? (
              <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8' />
            ) : (
              <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white
                 ${msg.senderId === authUser._id ? "rounded-br-none" : " rounded-bl-none"}`}>{msg.text}</p>
            )}
            <div className='text-center text-xs '>

              <img src={ msg.senderId === authUser._id 
                ? (authUser?.profilePic || assets.avatar_icon) 
                 : (selectedUser?.profilePic || assets.avatar_icon)} alt=""
                className='w-7 rounded-full ' />
              <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>

            </div>
          </div>

        ))}
      <div ref={scrollEnd}></div>
      </div>
      {/* bottomm area  */}

      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-black/20 backdrop-blur-md'>
        <div className='flex-1 flex items-center bg-gray-100/20 px-3 rounded-full'>
          <input
            onChange={(e)=>setInput(e.target.value)}
            value={input}
            onKeyDown={(e)=>e.key==="Enter" ? handleSendMesage(e):null}
            type="text"
            placeholder='Send a message...'
            className='flex-1 text-sm p-3 bg-transparent border-none rounded-lg outline-none text-white placeholder-gray-400'
          />
          <input onChange={handleSendImage} type="file" id="image" accept='image/png, image/jpeg' hidden />
          <label htmlFor="image" className='cursor-pointer'>
            <img src={assets.gallery_icon} alt="Upload" className='w-5 h-5 mr-2' />
          </label>
        </div>
        <img onClick={handleSendMesage} src={assets.send_button} alt="Send" className='w-7 cursor-pointer' />
      </div>

    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500'>
      <img src={assets.logo_icon} alt="" className='max-w-16  ' />
      <p className='text-lg font-medium text-white'>Chat,anytime anywhere</p>
    </div>
  )
}

export default ChatContainer