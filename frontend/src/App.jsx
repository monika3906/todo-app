
import './style/app.css'
import NavBar from './components/navbar'
import { Routes,Route } from 'react-router-dom'
import AddTask from './components/AddTask'
import List from './components/List'
import UpdateTask from './components/UpdateTask'
import SignUp from './components/Signup'
import Login from './components/Login'
import Protected from './components/Protected'

function App() {
  return (
    <>
    <NavBar />
    <Routes>
      <Route path='/' element={<Protected><List /></Protected>} />
      <Route path='/add' element={<Protected><AddTask /></Protected>} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/login' element={<Login />} />
      
      <Route path='/update/:id' element={<UpdateTask />} />


      </Routes>
    </>
  )
}

export default App
