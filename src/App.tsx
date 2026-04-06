import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Missing from "./pages/Missing";
import './index.css';
import { NavbarAndSidebar } from "./components/NavbarAndSidebar";
import { UserProvider } from "./provider/UserProvider";
import ProtectedRoute from "./utils/ProtectedRoute";
import { LoaderProvider } from "./provider/LoaderProvider";
import Loader from "./common/Loader";
import Home from "./pages/home/index";

// Lazy Loaded Components
const PackagesPage = lazy(() => import("./components/packages/packagesPage"));
const EditProfile = lazy(() => import("./components/user/editProfile"));
const QuizWrapper = lazy(() => import("./components/quiz/QuizWrapper").then(m => ({ default: m.QuizWrapper })));
const Result1 = lazy(() => import("./pages/result/Result"));
const ResultNew = lazy(() => import("./pages/result/Resultnew"));
const ExamSummary = lazy(() => import("./pages/result/ExamSummary"));
const QuizResultWrapper = lazy(() => import("./components/quiz/QuizResultProp"));
const PhoneOTP = lazy(() => import("./components/auth/PhoneOTP"));
const Registration = lazy(() => import("./components/auth/Registration"));

function App() {
  return (
    <UserProvider>
      <LoaderProvider>
        <Router>
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public Paths */}
              <Route path="/login" element={<PhoneOTP />} />
              <Route path="/register" element={<Registration />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<NavbarAndSidebar />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/packages" element={<PackagesPage />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path='/result' element={<Result1 />} />
                  <Route path='/resultnew' element={<ResultNew />} />
                  <Route path='/loader' element={<Loader />} />
                  <Route path="/exam-summary" element={<ExamSummary />} />
                </Route>
                <Route path='/quizresult' element={<QuizResultWrapper />} />
                <Route path='/quiz' element={<QuizWrapper />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<Missing />} />
            </Routes>
          </Suspense>
        </Router>
      </LoaderProvider>
    </UserProvider>
  );
}

export default App;

