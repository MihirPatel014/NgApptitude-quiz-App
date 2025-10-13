
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Missing from "./pages/Missing";
// import Login from "./components/auth/Login";
import AnimatedForm from "./components/auth/AnimatedForm";
import './index.css';
import { NavbarAndSidebar } from "./components/NavbarAndSidebar";
import { UserProvider } from "./provider/UserProvider";
import ProtectedRoute from "./utils/ProtectedRoute";
import PackagesPage from "./components/packages/packagesPage";
import EditProfile from "./components/user/editProfile";
import { QuizWrapper } from "./components/quiz/QuizWrapper";
import Home from "./pages/home/index";
import Result1 from "./pages/result/Result"
import { LoaderProvider } from "./provider/LoaderProvider";
import Loader from "./common/Loader";
import ResultNew from "./pages/result/Resultnew";
import QuizResultWrapper from "./components/quiz/QuizResultProp";
import PhoneOTP from "./components/auth/PhoneOTP";
function App() {
  return (
    <UserProvider>
      <LoaderProvider>
        <Router>
          <Routes>
            {/* Public Path */}
            {/* <Route path="/registeration" element={<Registeration />} /> */}
             <Route path="/loginwithotp" element={<PhoneOTP />} /> 
            <Route path="/login" element={<AnimatedForm />} />
            {/* <Route path="/login" element={<PhoneOtp />} /> */}
            <Route element={<ProtectedRoute />}>
              <Route element={<NavbarAndSidebar />}>
                {/* <Route path="/" element={<Home />} /> */}
                <Route path="/" element={<Home />} />

                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path='/result' element={<Result1 />} />
                <Route path='/resultnew' element={<ResultNew />} />
                <Route path='/loader' element={<Loader />} />
              </Route>
            </Route>
            <Route path='/quizresult' element={<QuizResultWrapper />} />
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
