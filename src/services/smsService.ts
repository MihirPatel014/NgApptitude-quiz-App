import axios from "axios";

interface SmsRequestParams {
  mobile: string;
  otp: string;
}

// The actual external SMS API response structure
interface ExternalSmsApiResponse {
  RESPONSE: {
    CODE: string;
    INFO: string;
    UID: string;
  };
  STATUS: string;
}

// The internal response format that the application expects
interface InternalSmsServiceResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

// const SMS_API_BASE_URL = process.env.REACT_APP_SMS_API_BASE_URL;
// const SMS_API_USER = process.env.REACT_APP_SMS_API_USER;
// const SMS_API_AUTHKEY = process.env.REACT_APP_SMS_API_AUTHKEY;
// const SMS_API_SENDER = process.env.REACT_APP_SMS_API_SENDER;

const SMS_API_BASE_URL = process.env.REACT_APP_SMS_API_BASE_URL || "";
const SMS_API_USER = process.env.REACT_APP_SMS_API_USER || "";
const SMS_API_AUTHKEY = process.env.REACT_APP_SMS_API_AUTHKEY || "";
const SMS_API_SENDER = process.env.REACT_APP_SMS_API_SENDER || "";

const OTP_TEMPLATE_ID = process.env.REACT_APP_SMS_OTP_TEMPLATE_ID || "";
const OTP_ENTITY_ID = process.env.REACT_APP_SMS_OTP_ENTITY_ID || "";
const OTP_TEMPLATE_CONTENT = "Thank you for your registration to opt Aptitude test. {#var#} is the OTP for registration of test with NG-Santvana. Do not share OTP to anyone NG-Santvana";

// New template constants for booking confirmation
const BOOKING_TEMPLATE_CONTENT = "Dear {#var#} Thank you for booking of your aptitude test with NG-Santvana Received amount full for test Best wishes for future way ahead NG-Santvana";
const BOOKING_TEMPLATE_ID = process.env.REACT_APP_SMS_BOOKING_TEMPLATE_ID || "";
const BOOKING_ENTITY_ID = process.env.REACT_APP_SMS_BOOKING_ENTITY_ID || "";

// New template constants for test report
const REPORT_TEMPLATE_CONTENT = "Dear {#var#},\nYou have finished your aptitude test and we have send you report on your mail id :{#var#}.\nYou can connect with us for further test/counselling.\n\nM- {#var#}\nNG-Santvana";
const REPORT_TEMPLATE_ID = process.env.REACT_APP_SMS_REPORT_TEMPLATE_ID || "";
const REPORT_ENTITY_ID = process.env.REACT_APP_SMS_REPORT_ENTITY_ID || "";

const smsHttp = axios.create({
  baseURL: SMS_API_BASE_URL,
});

export const sendSms = async (params: SmsRequestParams): Promise<InternalSmsServiceResponse> => {
  try {
    const smsText = OTP_TEMPLATE_CONTENT.replace("{#var#}", params.otp);
    if (!SMS_API_BASE_URL || !SMS_API_USER || !SMS_API_AUTHKEY || !SMS_API_SENDER || !OTP_ENTITY_ID || !OTP_TEMPLATE_ID) {
      return { success: false, errors: ["SMS configuration missing"] };
    }

    const response = await smsHttp.get<ExternalSmsApiResponse>(`/pushsms`, {
      params: {
        user: SMS_API_USER,
        authkey: SMS_API_AUTHKEY,
        sender: SMS_API_SENDER,
        mobile: params.mobile,
        text: smsText,
        entityid: OTP_ENTITY_ID,
        templateid: OTP_TEMPLATE_ID,
      },
    });

    if (response.data && response.data.STATUS === "OK") {
      return { success: true, message: response.data.RESPONSE.INFO };
    } else {
      const errorMessage = response.data?.RESPONSE?.INFO || "SMS sending failed with unknown error.";
      return { success: false, errors: [errorMessage] };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.RESPONSE?.INFO || error.message || "An unknown error occurred while sending SMS.";
    return { success: false, errors: [errorMessage] };
  }
};

/**
 * Sends a templated SMS message with dynamic variable substitution.
 * @param mobile The recipient's mobile number.
 * @param templateId The ID of the SMS template.
 * @param entityId The entity ID associated with the template.
 * @param templateContent The content of the template with {#var#} placeholders.
 * @param variables An array of strings to substitute into the {#var#} placeholders.
 * @returns A promise that resolves to an InternalSmsServiceResponse indicating success or failure.
 */
export const sendTemplatedSms = async (
  mobile: string,
  templateId: string,
  entityId: string,
  templateContent: string,
  variables: string[]
): Promise<InternalSmsServiceResponse> => {
  try {
    let smsText = templateContent;
    if (!SMS_API_BASE_URL || !SMS_API_USER || !SMS_API_AUTHKEY || !SMS_API_SENDER || !entityId || !templateId) {
      return { success: false, errors: ["SMS configuration missing"] };
    }
    let varIndex = 0;
    smsText = smsText.replace(/{#var#}/g, () => {
      const replacement = variables[varIndex] || '';
      varIndex++;
      return replacement;
    });

    const response = await smsHttp.get<ExternalSmsApiResponse>(`/pushsms`, {
      params: {
        user: SMS_API_USER,
        authkey: SMS_API_AUTHKEY,
        sender: SMS_API_SENDER,
        mobile: mobile,
        text: encodeURIComponent(smsText),
        entityid: entityId,
        templateid: templateId,
      },
    });

    if (response.data && response.data.STATUS === "OK") {
      return { success: true, message: response.data.RESPONSE.INFO };
    } else {
      const errorMessage = response.data?.RESPONSE?.INFO || "SMS sending failed with unknown error.";
      return { success: false, errors: [errorMessage] };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.RESPONSE?.INFO || error.message || "An unknown error occurred while sending SMS.";
    return { success: false, errors: [errorMessage] };
  }
};

export const sendAptitudeTestSms = async (
  mobile: string,
  name: string
): Promise<InternalSmsServiceResponse> => {
  return await sendTemplatedSms(
    mobile,
    BOOKING_TEMPLATE_ID,
    BOOKING_ENTITY_ID,
    BOOKING_TEMPLATE_CONTENT,
    [name] 
  );
};

export const sendExamReportSms = async (
  mobile: string,
  name: string,
  email: string
): Promise<InternalSmsServiceResponse> => {
  return await sendTemplatedSms(
    mobile,
    REPORT_TEMPLATE_ID,
    REPORT_ENTITY_ID,
    REPORT_TEMPLATE_CONTENT,
    [name, email, mobile] 
  );
};