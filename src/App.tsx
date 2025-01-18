import { createContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Registeration from "./components/auth/Registration";

import Missing from "./pages/Missing";
import Login from "./components/auth/Login";
import QuizPage from "./components/Home/QuizPage";
import { lookInSession, removeFromSession, storeInSession } from "./common/session";
import { User } from "./types/user";
import './index.css';
import { Navbar } from "./components/Navbar";
import Test from "./components/Home/test"
import Quiz from "./components/Home/Quiz";

// Define the context type
// interface UserContextType {
//   userAuth: User | null;
//   setUserAuth: (user: User | null) => void;
// }
export  const UserContext = createContext({});


function App() {
  const [user, setUser] = useState<User | null>(null);

  const [userAuth, setUserAuth] = useState({
    token: null,
  });

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ token: null });
  }, []);


  // const [user, setUser] = useState<User | null>(null);

  // // Check if the user is authenticated (you can implement your own logic here)
  // useEffect(() => {
  //   const storedUser = lookInSession('user');
  //   //  console.log(storedUser);
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);

  // const userAuth = user;
  // const setUserAuth = (user: User | null) => {
  //   setUser(user);
  //   if (user) {
  //      console.log(user)
  //     storeInSession('user', JSON.stringify(user)); // Store user info in local storage
  //   } else {
  //     removeFromSession('user'); // Remove user info when logged out
  //   }
  // };

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Router>
        <Routes>
          {/* Redirect to login if no user is authenticated */}
          {/* <Route   path="/"      element={userAuth ? <Navigate to="/quizpage" /> : <Navigate to="/login" />}      /> */}
          {/* <Route   path="/"      element={userAuth ? <Navigate to="/quizpage" /> :<Navigate to="/quizpage" />}      /> */}
          {/* <Route
            path="/"
            element={user ? <Navigate to="/quizpage" /> : <Navigate to="/login" />}
          /> */}
          <Route path="/" element={<Navbar />}>
            <Route path="/quizpage" element={<QuizPage user={user!} />} />
            <Route path='/quiz' element={<Quiz />} />
          </Route>

          <Route path="/registeration" element={<Registeration />} />
          <Route path="/login" element={<Login />} />


          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<Missing />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
