import React, { useEffect, useState, useContext } from "react";
import { getAllPackages, getPackageInfoByPackageId } from "../../services/packagesService";
import { GiftCodeResponseModel, GiftCodeValidationStatus, Packages, PackagesInfo } from "../../types/package";
import { CompletePaymentOrder, ProcessPayment, ValidateGiftCode } from "../../services/paymentService";
import { PaymentModel, TranscationDetail } from "../../types/payment";
import { UserContext } from "../../provider/UserProvider";
import { useNavigate } from "react-router-dom";
import { AddUserToPackage } from "../../services/authService";
import { AddUserToPackageApiModel } from "../../types/user";
import './package.css';
import { useLoader } from "../../provider/LoaderProvider";
import toast, { Toaster } from "react-hot-toast";


const PackagesPage = () => {
    let { userAuth } = useContext(UserContext);
    const [packages, setPackages] = useState<Packages[]>([]);
    // const [loading, setLoading] = useState<boolean>(true);
    const { setLoading } = useLoader();
    const [error, setError] = useState<string | null>(null);
    const [packageDetails, setPackageDetails] = useState<Map<number, PackagesInfo>>(new Map());
    const navigate = useNavigate();

    // Coupon State Variables
    const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [discountedPrices, setDiscountedPrices] = useState<{ [key: number]: number }>({});
    const [appliedCoupons, setAppliedCoupons] = useState<{ [key: number]: string }>({});

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
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const response = await getAllPackages();
                if (response) {
                    setPackages(response.filter((pkg) => pkg.isActive));
                    setLoading(false);

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

    // const validateCoupon = async (code: string, packageId: number): Promise<{ isValid: boolean; discountedAmount: number }> => {
    //     try {

    //         const response = await ValidateGiftCode(code, packageId);

    //         if (response?.data?.GiftCodeStatus === GiftCodeValidationStatus.Valid) {
    //             return {
    //                 isValid: true,
    //                 discountedAmount: response.data.DiscountedValue
    //             };
    //         }

    //         return { isValid: false, discountedAmount: 0 };
    //     } catch (error) {
    //         console.error("Error validating coupon:", error);
    //         return { isValid: false, discountedAmount: 0 };
    //     }
    // };
    const validateCoupon = async (code: string, packageId: number): Promise<{ isValid: boolean; discountedAmount: number, giftCodeId: number }> => {
        setLoading(true);
        try {
            const response = await ValidateGiftCode(code, packageId);

            if (!response) {
                console.error("Invalid response structure:", response);
                return { isValid: false, discountedAmount: 0, giftCodeId: 0 };
            }

            // Debugging: Log the full response
            console.log("Gift Code Response:", response);
            if (response != null) {

                // Ensure we check against `GiftCodeValidationStatus.Valid`
                if (response.giftCodeStatus === GiftCodeValidationStatus.Valid) {
                    return {
                        isValid: true,
                        discountedAmount: Number(response.discountedValue),
                        giftCodeId: response.giftCodeId
                    };
                }
            }

            setLoading(false);
            return { isValid: false, discountedAmount: 0, giftCodeId: 0 };
        } catch (error) {
            setLoading(false);
            console.error("Error validating Gift Code:", error);
            return { isValid: false, discountedAmount: 0, giftCodeId: 0 };
        }
    };

    const applyCoupon = async () => {
        if (!selectedPackageId) {
            toast.success("Please select a package first.");
            return;
        }

        const { isValid, discountedAmount, giftCodeId } = await validateCoupon(couponCode, selectedPackageId);
        if (isValid) {
            setDiscountedPrices((prev) => ({ ...prev, [selectedPackageId]: discountedAmount }));
            setAppliedCoupons((prev) => ({ ...prev, [selectedPackageId]: couponCode }));
            toast.success(`Gift Code applied! New amount: ₹${discountedAmount.toFixed(2)}`);
        } else {
            toast.error("Invalid Or Gift Code Is expired.");
        }

        setIsCouponDialogOpen(false);
    };
    const completeOrderInternally = async (paymentModel: PaymentModel, finalAmount: number, giftCodeId: number) => {
        setLoading(false);
        try {
            const merchantOrder = await ProcessPayment(paymentModel);
            if (merchantOrder) {

                const result = await CompletePaymentOrder({
                    razorpayPaymentId: merchantOrder?.razorpayPaymentId.toString(),        //These values should be null because they are not coming from razopay
                    razorpayOrderId: merchantOrder?.razorpayOrderId,
                    razorpaySignature: merchantOrder.razorpayOrderId,
                    paymentMethod: "Internal Handling (Zero Amount)",
                    discountedAmount: finalAmount.toString(),
                    giftCodeId: giftCodeId.toString()
                });
                if (result) {
                    const packageId = paymentModel.packageId;
                    if (packageId) {
                        const userPackageApiModel: AddUserToPackageApiModel = {
                            UserId: userAuth?.userId || 0,
                            TransactionId: result.id,
                            PackageId: paymentModel.packageId,
                        }
                        const adduserToPackage = await AddUserToPackage(userPackageApiModel);
                    }
                    setLoading(true);
                    toast.success('Package activated successfully!');
                    navigate("/quizpage");
                } else {
                    toast.success('Failed to activate package. Please contact support.');
                }
            }
        } catch (error) {
            console.error('Error completing order internally:', error);
            toast.error('Failed to activate package. Please contact support.');
        }
    };

    const handlePackageSelection = async (packageId: number, packageAmount: number) => {
        let finalAmount = packageAmount;
        let currentgiftCodeId = 0;
        // Apply coupon discount if a valid coupon code exists
        if (couponCode) {
            const { isValid, discountedAmount, giftCodeId } = await validateCoupon(couponCode, packageId);
            if (isValid) {
                currentgiftCodeId = giftCodeId;
                finalAmount = discountedAmount;

            } else {
                toast.error("Invalid Gift Code.");
            }
        }

        const paymentModel: PaymentModel = {
            name: userAuth?.email.split('@')[0] || '',
            email: userAuth?.email || '',
            phoneNumber: '',
            address: '',
            amount: finalAmount,
            packageId: packageId,
            userId: userAuth?.userId || 0,
            userGuid: userAuth?.userGuidId || ''
        };


        if (paymentModel.amount === 0) {
            completeOrderInternally(paymentModel, finalAmount, currentgiftCodeId);
        } else {
            handlePayment(paymentModel, packageId, finalAmount, currentgiftCodeId);
        }
    };

    const handlePayment = async (paymentModel: PaymentModel, packageId: number, finalAmount: number, giftCodeId: number) => {
        setLoading(true);
        try {
            const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
            }

            const merchantOrder = await ProcessPayment(paymentModel);

            if (merchantOrder != null) {
                let selectedPaymentMethod = "";
                const options = {
                    key: merchantOrder?.razorpayPaymentId,
                    amount: merchantOrder?.amount,
                    currency: merchantOrder?.currency,
                    name: paymentModel.name,
                    description: "",
                    order_id: merchantOrder?.razorpayOrderId,
                    handler: async function (response: any) {
                        try {
                            console.log("Payment Completed. Sending to backend...");
                            console.log("Payment Method:", selectedPaymentMethod);

                            const result = await CompletePaymentOrder({
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                                paymentMethod: selectedPaymentMethod || "Unknown",
                                discountedAmount: finalAmount.toString(),
                                giftCodeId: giftCodeId.toString()
                            });

                            if (result) {
                                toast.success('Payment successful! Your package has been activated.');
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
                                toast.success('Payment verification failed. Please contact support.');
                            }
                        } catch (error) {
                            console.log('Error completing payment:', error);
                            toast.error('Payment verification failed. Please contact support.');
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
                paymentObject.on("payment.submit", (response: any) => {
                    console.log("Payment method selected:", response.method);
                    selectedPaymentMethod = response.method || "Unknown";
                });
                paymentObject.open();
            }
            
            setLoading(false);
        } catch (error: any) {
            console.log('Payment initialization failed:', error);
            toast.error(error.message);
            toast.error('Unable to initialize payment. Please try again later.');
            setLoading(false);
        }
    };



    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl text-red-600">{error}</h1>
            </div>
        );
    }
    const removeCoupon = (packageId: number) => {
        setCouponCode('');
        setDiscountedPrices((prev) => {
            const updatedPrices = { ...prev };
            delete updatedPrices[packageId];
            return updatedPrices;
        });

        setAppliedCoupons((prev) => {
            const updatedCoupons = { ...prev };
            delete updatedCoupons[packageId];
            return updatedCoupons;
        });

        toast.success("Gift Code removed!");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            <Toaster />
            <h1 className="mb-6 text-3xl font-bold text-center">Choose a Package</h1>
            {/* Coupon Dialog */}
            {isCouponDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative p-6 bg-white rounded-md shadow-lg w-96">
                        <h2 className="mb-4 text-lg font-semibold">Enter Gift Code </h2>
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter Gift Code"
                        />
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={async () => {
                                    if (!selectedPackageId) {
                                        toast.custom("Please select a package first.");
                                        return;
                                    }

                                    const { isValid, discountedAmount } = await validateCoupon(couponCode, selectedPackageId);
                                    if (isValid) {
                                        setDiscountedPrices((prev) => ({ ...prev, [selectedPackageId]: discountedAmount }));
                                        setAppliedCoupons((prev) => ({ ...prev, [selectedPackageId]: couponCode }));
                                        toast.success(`Gift Code applied! New amount: ₹${discountedAmount.toFixed(2)}`);
                                    } else {
                                        toast.error("Invalid Gift Code.");
                                    }
                                    setLoading(false);
                                    setIsCouponDialogOpen(false);
                                }}
                                className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                            >
                                Apply
                            </button>
                            <button
                                onClick={() => setIsCouponDialogOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* {packages.map((pkg, index) => {
                const details = packageDetails.get(pkg.id);
                return (
                    <div
                        key={index}
                        className="flex flex-col p-6 mt-5 bg-white rounded-lg shadow-md md:flex-row hover:shadow-lg min-w-0.5 max-w-6xl"
                    >
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

                        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-md">
                            <p className="mb-2 text-3xl font-bold text-secondary">₹ {pkg.price.toFixed(2)}</p>

                            <button
                                onClick={() => {
                                    setSelectedPackageId(pkg.id); // Store the selected package ID
                                    setIsCouponDialogOpen(true);
                                }}
                                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Apply Coupon
                            </button>
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
            })} */}
            {packages.map((pkg) => {
                const details = packageDetails.get(pkg.id);
                const discountedPrice = discountedPrices[pkg.id] ?? pkg.price;
                const hasDiscount = appliedCoupons[pkg.id] !== undefined;

                return (
                    <div key={pkg.id} className="flex flex-col p-6 mt-5 transition-transform duration-300 transform bg-white rounded-lg shadow-md md:flex-row hover:shadow-lg">
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

                        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-md">
                            {/* Animated Price Change */}
                            <div className={`transition-transform duration-500 ${hasDiscount ? "text-green-600 scale-110" : "text-secondary"}`}>
                                <p className="mb-2 text-3xl font-bold">
                                    ₹ {discountedPrice.toFixed(2)}
                                </p>
                            </div>

                            {/* Applied Coupon Message or Apply Button */}
                            {hasDiscount ? (
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-green-600">Gift Code Applied: {appliedCoupons[pkg.id]}</span>
                                    <button
                                        onClick={() => removeCoupon(pkg.id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Remove Coupon"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setSelectedPackageId(pkg.id);
                                        setIsCouponDialogOpen(true);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Apply Gift Code
                                </button>
                            )}

                            {/* Purchase Button */}
                            <button
                                onClick={() => handlePackageSelection(pkg.id, discountedPrice)}
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
