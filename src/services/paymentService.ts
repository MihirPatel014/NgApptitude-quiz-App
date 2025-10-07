import axios from "axios";
import { apiRequest } from "../common/requestwithdata";
import { PaymentModel, MerchantOrderDetails, TranscationDetail, RequestGiftCodeModel } from "../types/payment";
import { handleApiResponse } from "../common/http-common";
import { GiftCodeResponseModel } from "../types/package";


// api/User/Register
const PROCESS_REQUEST_ORDER = 'process-request-order';
const COMPLETE_REQUEST_ORDER = 'complete-order-process';
const VALIDATE_GIFT_CODE = 'validate-gift-code';
 
const API_URL = process.env.REACT_APP_API_URL;

export const ProcessPayment = async (data: PaymentModel) => {

    try {
        const response = await axios.post(`${API_URL}${PROCESS_REQUEST_ORDER}`, data);
        const result = handleApiResponse<TranscationDetail>(response.data);
        if (result.success) {

            return result.data;
        } 
    } catch (error) {
        console.log("Error processing payment:", error);
        throw error;
    }

};
export const ValidateGiftCode = async (codeName: string, packageId: number) => {
    var data: RequestGiftCodeModel = {
        packageId: packageId,
        giftCode: codeName
    }
    try {
        const response = await axios.post(`${API_URL}${VALIDATE_GIFT_CODE}`, data);
        const result = handleApiResponse<GiftCodeResponseModel>(response.data);
        if (result.success) {

            return result.data;
        } else {
            // Handle API-level errors
            console.log("Registration failed with errors:", result.errors);
            return null;
        }
        
    } catch (error) {
        console.log("Error processing GiftCode:", error);
        throw error;
    }

};
// export const CompletePaymentOrder = async () => {
//     try {
//         const response = await axios.post(`${API_URL}${COMPLETE_REQUEST_ORDER}`);
//         console.log("Order completion successful:", response.data);
//         return response.data; // { status: "Success", message: "Payment captured successfully." }
//     } catch (error) {
//         console.log("Error completing order:", error);
//         throw error;
//     }
// };

export const CompletePaymentOrder = async (paymentDetails: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    paymentMethod: string;
    discountedAmount:string;
    giftCodeId:string;
}) => {
    try {
        // Create FormData
        const formData = new FormData();
        formData.append("rzp_paymentid", paymentDetails.razorpayPaymentId);
        formData.append("rzp_orderid", paymentDetails.razorpayOrderId);
        formData.append("rzp_signature", paymentDetails.razorpaySignature);
        formData.append("payment_method", paymentDetails.paymentMethod);
        formData.append("discounted_amount", paymentDetails.discountedAmount);
        formData.append("gift_code_id", paymentDetails.giftCodeId);

        // Send request with FormData
        const response = await axios.post(
            `${API_URL}${COMPLETE_REQUEST_ORDER}`,
            formData, // Sending form data
            {
                headers: {
                    "Content-Type": "multipart/form-data" // ✅ Required for FormData
                }
            }
        );

        console.log("Order completion successful:", response.data);
        const result = handleApiResponse<TranscationDetail>(response.data);
        if (result.success) {

            return result.data;
        } else {
            // Handle API-level errors
            console.log("Registration failed with errors:", result.errors);
            return null;
        }

    } catch (error) {
        console.log("Error completing order:", error);
        throw error;

    };
}