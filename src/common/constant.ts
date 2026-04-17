/**
 * Application Constants
 */

export enum UserLoginResults {
    Successful = 1,
    UserNotExist = 2,
    WrongPassword = 3,
    NotActive = 4,
    Deleted = 5,
    VerifyContactNoPending = 7,
    VerifyEmailPending = 8,
    AccountLockout = 6,
}

export enum UserRegistrationResults {
    Successful = 1,
    ContactNoAlreadyExists = 2,
    InvalidDetails = 3,
    PasswordPolicyNotMet = 4,
    EmailAlreadyExists = 5,
    ServerError = 6
}

export enum QuestionSumitStatus {
    Pending = 1,
    Started = 2,
    InExam = 3,
    Complete = 4
}

export const REGEX = {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^(\+91[- \s]?)?[0]?(91)?[6789]\d{9}$/,
    PASSWORD: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/,
} as const;

export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/",
    PACKAGES: "/packages",
    EDIT_PROFILE: "/editprofile",
    RESULT: "/result",
    RESULT_NEW: "/resultnew",
    EXAM_SUMMARY: "/examsummary",
    QUIZ: "/quiz",
    QUIZ_RESULT: "/quizresult",
    LOADER: "/loader",
    
    // Legal Pages
    PRIVACY_POLICY: "/privacypolicy",
    TERMS_CONDITIONS: "/termsconditions",
    REFUND_POLICY: "/refundpolicy",
    CONTACT_US: "/contactus"
} as const;

export const APP_CONFIG = {
    NAME: "NG Aptitude Quiz",
    API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    FILE_API_URL: import.meta.env.VITE_DOCU_API_URL || "",
} as const;

export const QUIZ_CONFIG = {
    TIMER_INTERVAL_MS: 1000,
    SECRET_CODE: "admin",
    SECRET_CODE_TIMEOUT_MS: 2000,
} as const;

export const MESSAGES = {
    EXIT_CONFIRMATION: 'Are you sure you want to leave? Your progress will be lost!',
    SUBMIT_SUCCESS: 'Quiz submitted successfully!',
    SUBMIT_FAILURE: 'Failed to submit exam. Please try again.',
    ANSWER_REQUIRED: 'Please select an answer before proceeding',
    ALL_REQUIRED: 'Please answer all questions before submitting the quiz',
} as const;
