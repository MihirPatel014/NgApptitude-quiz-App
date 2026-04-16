export enum userLoginResults {
    Successful = 1,
    UserNotExist = 2,
    WrongPassword = 3,
    NotActive = 4,
    Deleted = 5,
    VerifyContactNoPending = 7,
    VerifyEmailPending = 8,
    AccountLockout = 6,
};

export enum UserRegistrationResults {
    Successful = 1,
    ContactNoAlreadyExists = 2,
    InvalidDetails = 3,
    PasswordPolicyNotMet = 4,
    EmailAlreadyExists = 5,
    ServerError = 6
}

export enum QuestionSumitStatus {
    pending = 1,
    started = 2,
    Inexam = 3,
    complete = 4
}

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Advanced Phone regex: handles +91, spaces, hyphens, leading 0, and 91 prefix
export const phoneRegex = /^(\+91[- \s]?)?[0]?(91)?[6789]\d{9}$/;

// export const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;
