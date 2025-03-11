import axios from "axios";
import { apiRequest } from "../common/requestwithdata";
import { PaymentModel, MerchantOrderDetails, TranscationDetail } from "../types/payment";


// api/User/Register
const PROCESS_REQUEST_ORDER = 'process-request-order';
const COMPLETE_REQUEST_ORDER = 'complete-order-process';
const API_URL = "https://localhost:44389/";
export const ProcessPayment = async (data: PaymentModel) => {

    try {
        const response = await axios.post(`${API_URL}${PROCESS_REQUEST_ORDER}`, data);
        return response.data.data; // This should be the processed `MerchantOrder`
    } catch (error) {
        console.log("Error processing payment:", error);
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
}) => {
    try {
        // Create FormData
        const formData = new FormData();
        formData.append("rzp_paymentid", paymentDetails.razorpayPaymentId);
        formData.append("rzp_orderid", paymentDetails.razorpayOrderId);
        formData.append("rzp_signature", paymentDetails.razorpaySignature);
        formData.append("payment_method", paymentDetails.paymentMethod);

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
        return response.data.data; // { status: "Success", message: "Payment captured successfully." }

    } catch (error) {
        console.log("Error completing order:", error);
        throw error;

    };
}