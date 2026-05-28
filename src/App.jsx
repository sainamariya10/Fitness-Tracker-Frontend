import React,{ useState,useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import { FitnessProvider } from './components/FitnessContext';
import Goals from "./components/Goals";
import Workout from "./components/Workout";
import Diet from "./components/Diet";
import Progress from "./components/Progress";
import Social from "./components/Social";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import APITest from "./components/APITest";

// ... import other page subcomponents here

function MainAppLayout() {
  const location = useLocation();
  
  // Define exactly which URL strings must suppress the navbar
  const hideNavbarPaths = ["/", "/register"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
    <FitnessProvider>
      {/* Navbar renders conditionally based on URL matching rules */}
      {shouldShowNavbar && <Navbar />}
    
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Route path="/dash" element={<Dashboard/>} />
        <Route path="/home" element={<Home/>} />
       
        <Route path="/goals" element={<Goals/>} />
        <Route path="/workout" element={<Workout/>} />
        <Route path="/diet" element={<Diet/>} />
        <Route path="/progress" element={<Progress/>} />
        <Route path="/social" element={<Social/>} />
        <Route path="/profile" element={<Profile/>} />
         <Route path="/admin" element={<AdminDashboard/>} />
         <Route path="/test" element={<APITest/>} />
        
      </Routes>
      </FitnessProvider>
    </>
  );
}

function App() {

  // // 1. Create a state variable to store your backend data
  // const [backendData, setBackendData] = useState('');

  // // 2. Create the function to fetch data from the backend
  // const handleConnectBackend = async () => {
  //   try {
  //     // Replace with your actual backend URL (e.g., http://localhost:5000/api)
  //     const response = await fetch('http://localhost:5000/api/data'); 
  //     const data = await response.json();
      
  //     // 3. Save the data to your state
  //     setBackendData(data.message); 
  //   } catch (error) {
  //     console.error("Error connecting to backend:", error);
  //   }
  // };

  // // 4. Trigger the function using a React onClick event handler
  // return (
  //   <div style={{ padding: '20px', textAlign: 'center' }}>
  //     <h1>Frontend App</h1>
  //     <button onClick={handleConnectBackend}>Connect Backend</button>
      
  //     {backendData && <p>Data from Server: {backendData}</p>}
  //   </div>
  // );


  return (
    <Router>
      <MainAppLayout />
    </Router>
  );
}
export default App;