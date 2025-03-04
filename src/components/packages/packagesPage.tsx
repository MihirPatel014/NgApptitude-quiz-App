// src/components/PackagesPage.tsx
import React, { useEffect, useState, createContext, useContext, useRef } from "react";

import { getAllPackages, getPackageInfoByPackageId } from "../../services/packagesService"; // Update with the correct path to your service
import { Packages, PackagesInfo } from "../../types/package"; // Update with the correct path to your model
import { CompletePaymentOrder, ProcessPayment } from "../../services/paymentService";
import { MerchantOrderDetails, PaymentModel, TranscationDetail } from "../../types/payment";
import { UserContext } from "../../provider/UserProvider";
import { useNavigate } from "react-router-dom";
import { AddUserToPackage } from "../../services/authService";
import { AddUserToPackageApiModel } from "../../types/user";


// export const packageDetails = createContext({});

const PackagesPage = () => {
    let { userAuth } = useContext(UserContext);
    const [packages, setPackages] = useState<Packages[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [packageDetails, setPackageDetails] = useState<Map<number, PackagesInfo>>(new Map()); // Store details for each package by id
    const navigate = useNavigate();

    const loadScript = (src: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        // Fetch packages from the API
        const fetchPackages = async () => {
            try {
                const response = await getAllPackages();
                if (response) {
                    setPackages(response.filter((pkg) => pkg.isActive)); // Only show active packages
                    setLoading(false);

                    // Fetch and store details for each package
                    for (const pkg of response) {
                        const details = await getPackageInfoByPackageId(pkg.id);
                        if (details) {
                            setPackageDetails((prevDetails) => new Map(prevDetails).set(pkg.id, details));
                        }
                    }
                }
            } catch (err) {
                setError("Failed to load packages. Please try again later.");
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    const handlePackageSelection = (packageId: number, packageAmount: number) => {
        const paymentModel: PaymentModel = {
            name: userAuth?.email.split('@')[0] || '',
            email: userAuth?.email || '',
            phoneNumber: '',
            address: '',
            amount: packageAmount,
            packageId: packageId,
            userId: userAuth?.userId || 0,
            userGuid: userAuth?.userGuidId || ''
        }
        // navigate(`/payment/${packageId}`);
        if (paymentModel) {
            handlePayment(paymentModel, packageId);

        }
    };

    const handlePayment = async (paymentModel: PaymentModel, packageId: number) => {
        try {
            // Load Razorpay SDK
            const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
            }

            // Get merchant order details from backend
            const merchantOrder: TranscationDetail = await ProcessPayment(paymentModel);
            let selectedPaymentMethod = ""; // Store payment method globally
            // Configure Razorpay options using merchant order details
            const options = {
                key: merchantOrder.razorpayPaymentId,
                amount: merchantOrder.amount,
                currency: merchantOrder.currency,
                name: paymentModel.name,
                description: "",
                order_id: merchantOrder.razorpayOrderId,
                handler: async function (response: any) {
                    try {

                        console.log("Payment Completed. Sending to backend...");
                        console.log("Payment Method:", selectedPaymentMethod); // Ensure we have the method

                        // Call CompletePaymentOrder without parameters
                        const result : TranscationDetail = await CompletePaymentOrder({
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            paymentMethod: selectedPaymentMethod || "Unknown", // Ensure it's a string
                        });
                        // const result.data : TransactionDetail ={}
                        if(result) {
                    alert('Payment successful! Your package has been activated.');
                    // Optionally refresh the page or redirect
                    // window.location.reload();
                    const packageId = paymentModel.packageId;
                    if (packageId) {
                        const userPackageApiModel: AddUserToPackageApiModel = {
                            UserId: userAuth?.userId || 0,
                            TransactionId: result.id,
                            PackageId: paymentModel.packageId,
                        }
                        const adduserToPackage = await AddUserToPackage(userPackageApiModel);
                    }
                    navigate("/quizpage");
                } else {
                    alert('Payment verification failed. Please contact support.');
                }
            } catch (error) {
                console.log('Error completing payment:', error);
                alert('Payment verification failed. Please contact support.');
            }
        },
        prefill: {
            name: paymentModel.name,
                email: paymentModel.email,
                    contact: ""
        },
        modal: {
            ondismiss: function () {
                console.log('Payment cancelled by user');
            }
        }
    };

    const paymentObject = new (window as any).Razorpay(options);
    // Capture the selected payment method before submission
    paymentObject.on("payment.submit", (response: any) => {
        console.log("Payment method selected:", response.method);
        selectedPaymentMethod = response.method || "Unknown"; // Store globally
    });

    paymentObject.open();

} catch (error) {
    console.log('Payment initialization failed:', error);
    alert('Unable to initialize payment. Please try again later.');
}
    };
if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold">Loading packages...</h1>
        </div>
    );
}

if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl text-red-600">{error}</h1>
        </div>
    );
}

return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <h1 className="mb-6 text-3xl font-bold text-center">Choose a Package</h1>


        {packages.map((pkg, index) => {
            const details = packageDetails.get(pkg.id); // Get the package details
            return (
                <div
                    key={index}
                    className="flex flex-col p-6 mt-5 bg-white rounded-lg shadow-md md:flex-row hover:shadow-lg min-w-0.5 max-w-6xl"
                >
                    {/* Left Section */}
                    <div className="flex-1 p-7">
                        <h2 className="mb-2 text-2xl font-bold">{pkg.name}</h2>
                        <p className="mb-4 text-gray-700">{pkg.description}</p>
                        <h3 className="mb-4 text-xl font-semibold">What's included:</h3>
                        <ul className="pl-5 space-y-2 text-gray-600 list-disc">

                            {details?.exams.map((exam) => (
                                <li key={exam.id}>{exam.name}</li>
                            ))}
                        </ul>


                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-md">

                        <p className="mb-2 text-3xl font-bold text-secondary">₹ {pkg.price.toFixed(2)}</p>
                        <button
                            onClick={() => handlePackageSelection(pkg.id, pkg.price)}
                            className="px-6 py-2 text-white rounded bg-primary"
                        >
                            Get Access
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                            Invoices and receipts available for easy company reimbursement
                        </p>
                    </div>
                </div>
            );
        })}

    </div>

);
};

export default PackagesPage;
