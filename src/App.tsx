
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Missing from "./pages/Missing";
// import Login from "./components/auth/Login";
import AnimatedForm from "./components/auth/AnimatedForm";
import QuizPage from "./components/quiz/QuizPage";


import './index.css';

import { NavbarAndSidebar } from "./components/NavbarAndSidebar";

import Quiz, { QuizProps } from "./components/quiz/Quiz";
import { UserProvider } from "./provider/UserProvider";

import ProtectedRoute from "./utils/ProtectedRoute";

import PackagesPage from "./components/packages/packagesPage";

import EditProfile from "./components/user/editProfile";

import { QuizWrapper } from "./components/quiz/QuizWrapper";
import Home from "./pages/home";
import Subscription from "./components/user/subscription";
import Result1 from "./pages/result/Result"
import { ResultWrapper } from "./pages/result/ResultWrapper";
import { LoaderProvider } from "./provider/LoaderProvider";
import Loader from "./common/Loader";




function App() {


  return (
    <UserProvider>
      <LoaderProvider>     
      <Router>
        <Routes>
          {/* Public Path */}
          {/* <Route path="/registeration" element={<Registeration />} /> */}
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/login" element={<AnimatedForm />} />
          {/* <Route path="/login" element={<PhoneOtp />} /> */}
          <Route element={<ProtectedRoute />}>
            <Route element={<NavbarAndSidebar />}>
              <Route path="/" element={<Home />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/quizpage" element={<QuizPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/edit-profile" element={<EditProfile />} />


              <Route path='/result' element={<ResultWrapper />} />
              <Route path='/loader' element={<Loader />} />


            </Route>
          </Route>

          <Route path='/quiz' element={<QuizWrapper />} />
          {/* <Route path='/quiz' element={<Quiz value={QuizProps} />} /> */}
          {/* <Route path="/quiz/:userId/:examId/:sectionId/:timeLimit/:userExamProgressId/:userPackageId/:packageId/:examSubmitId" element={<Quiz />} /> */}

          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<Missing />} />
        </Routes>
      </Router>
      </LoaderProvider>
    </UserProvider>
  );
}

export default App;
