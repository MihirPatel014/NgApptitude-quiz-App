import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Missing from "./pages/Missing";
// import Login from "./components/auth/Login";
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
import ExamSummary from "./pages/result/ExamSummary";
import QuizResultWrapper from "./components/quiz/QuizResultProp";
import PhoneOTP from "./components/auth/PhoneOTP";
import Registration from "./components/auth/Registration";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ContactUs from "./pages/legal/ContactUs";
import { ROUTES } from "./common/routes";


function App() {
  return (
    <UserProvider>
      <LoaderProvider>
        <Router>
          <Routes>
            {/* Public Path */}
            {/* <Route path="/registeration" element={<Registeration />} /> */}
            {/* <Route path="/loginwithotp" element={<PhoneOTP />} />  */}
            <Route path={ROUTES.LOGIN} element={<PhoneOTP />} />
            <Route path={ROUTES.REGISTER} element={<Registration />} />
            <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
            <Route path={ROUTES.TERMS_CONDITIONS} element={<TermsAndConditions />} />
            <Route path={ROUTES.REFUND_POLICY} element={<RefundPolicy />} />
            <Route path={ROUTES.CONTACT_US} element={<ContactUs />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<NavbarAndSidebar />}>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.PACKAGES} element={<PackagesPage />} />
                <Route path={ROUTES.EDIT_PROFILE} element={<EditProfile />} />
                <Route path={ROUTES.RESULT} element={<Result1 />} />
                <Route path={ROUTES.RESULT_NEW} element={<ResultNew />} />
                <Route path={ROUTES.LOADER} element={<Loader />} />
                <Route path={ROUTES.EXAM_SUMMARY} element={<ExamSummary />} />
              </Route>
              <Route path={ROUTES.QUIZ_RESULT} element={<QuizResultWrapper />} />
              <Route path={ROUTES.QUIZ} element={<QuizWrapper />} />
            </Route>
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
