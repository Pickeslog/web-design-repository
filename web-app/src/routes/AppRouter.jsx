import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Auth/Login'
import Signup from '../pages/Auth/Signup'
import Dashboard from '../pages/Dashboard/Dashboard'
import MakeRoom from '../pages/Rooms/MakeRoom'
import JoinRoom from '../pages/Rooms/JoinRoom'
import Invite from '../pages/Rooms/Invite'
import Feed from '../pages/Feed/Feed'
import MemoryDetail from '../pages/Feed/MemoryDetail'
import LetterDetail from '../pages/Letter/LetterDetail'
import Notification from '../pages/Notification/Notification'
import ProfileEdit from '../pages/Profile/ProfileEdit'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/rooms/make" element={<MakeRoom />} />
        <Route path="/rooms/join" element={<JoinRoom />} />
        <Route path="/rooms/invite" element={<Invite />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/:memoryId" element={<MemoryDetail />} />
        <Route path="/letter/:letterId" element={<LetterDetail />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
      </Routes>
    </BrowserRouter>
  )
}
