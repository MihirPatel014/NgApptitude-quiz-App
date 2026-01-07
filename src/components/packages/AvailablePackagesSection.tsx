import React, { useContext, useEffect, useState } from "react";
import { getAllPackages, getPackageInfoByPackageId } from "../../services/packagesService";
import { GiftCodeValidationStatus, Packages, PackagesInfo } from "../../types/package";
import { CompletePaymentOrder, ProcessPayment, ValidateGiftCode } from "../../services/paymentService";
import { PaymentModel } from "../../types/payment";
import { UserContext } from "../../provider/UserProvider";
import { useNavigate } from "react-router-dom";
import { AddUserToPackage, GetUserPackageInfoByUserId } from "../../services/authService";
import { AddUserToPackageApiModel } from "../../types/user";
import { useLoader } from "../../provider/LoaderProvider";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, ShoppingCart, Star, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { sendAptitudeTestSms } from "../../services/smsService";


const AvailablePackagesSection = () => {
    let { userAuth } = useContext(UserContext);
    const [packages, setPackages] = useState<Packages[]>([]);
    const { setLoading } = useLoader();
    const [error, setError] = useState<string | null>(null);
    const [packageDetails, setPackageDetails] = useState<Map<number, PackagesInfo>>(new Map());
    const navigate = useNavigate();
    const queryClient = useQueryClient();

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

    const validateCoupon = async (code: string, packageId: number): Promise<{ isValid: boolean; discountedAmount: number, giftCodeId: number }> => {
        setLoading(true);
        try {
            const response = await ValidateGiftCode(code, packageId);

            if (!response) {
                console.log("Invalid response structure:", response);
                setLoading(false);
                return { isValid: false, discountedAmount: 0, giftCodeId: 0 };
            }

            console.log("Gift Code Response:", response);
            if (response != null) {

                if (response.giftCodeStatus === GiftCodeValidationStatus.Valid) {
                    const discountedValue = Number(response.discountedValue);

                    // Ensure the discounted amount is never negative
                    const finalAmount = Math.max(0, discountedValue);

                    console.log("Original discounted value:", discountedValue);
                    console.log("Final amount (after validation):", finalAmount);

                    // Warn if backend returned negative value (but still apply it as ₹0)
                    if (discountedValue < 0) {
                        console.warn("⚠️ Backend returned negative discount value:", discountedValue, "- Applying as ₹0");
                    }

                    setLoading(false);
                    return {
                        isValid: true,
                        discountedAmount: finalAmount,
                        giftCodeId: response.giftCodeId
                    };
                }
            }

            setLoading(false);
            return { isValid: false, discountedAmount: 0, giftCodeId: 0 };
        } catch (error) {
            setLoading(false);
            console.log("Error validating Gift Code:", error);
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
        console.log("🔵 [FREE PACKAGE] Starting completeOrderInternally");
        setLoading(true);
        console.log("🔵 [FREE PACKAGE] Loader set to TRUE");
        try {
            console.log("🔵 [FREE PACKAGE] Calling ProcessPayment...");
            const merchantOrder = await ProcessPayment(paymentModel);
            console.log("🔵 [FREE PACKAGE] ProcessPayment response:", merchantOrder);

            if (merchantOrder) {

                const result = await CompletePaymentOrder({
                    razorpayPaymentId: merchantOrder?.razorpayPaymentId.toString(),
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

                        AddUserToPackage(userPackageApiModel);
                        await queryClient.invalidateQueries({ queryKey: ["userPackages"] });

                        //                        if (userAuth?.contactNo) {
                        //    await sendAptitudeTestSms(userAuth.contactNo, userAuth.email.split('@')[0] || "User");
                        //   if (smsResponse.success) {
                        //     toast.success("SMS sent successfully!");
                        //   } else {
                        //     toast.error("SMS sending failed: " + (smsResponse.errors?.[0] || ""));
                        //   }
                        // }

                    }
                    console.log("🔵 [FREE PACKAGE] Invalidating queries...");
                    await queryClient.invalidateQueries({ queryKey: ["userPackages"] });
                    console.log("🔵 [FREE PACKAGE] Queries invalidated successfully");

                    toast.success('Package activated successfully! Redirecting to dashboard...');
                    console.log("🔵 [FREE PACKAGE] Navigating to dashboard in 500ms...");

                    // Keep loader visible during navigation
                    setTimeout(() => {
                        console.log("🔵 [FREE PACKAGE] Executing navigation now");
                        navigate("/");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 500);
                } else {
                    console.log("🔴 [FREE PACKAGE] Payment result is null/false");
                    setLoading(false);
                    console.log("🔴 [FREE PACKAGE] Loader set to FALSE");
                    toast.error('Failed to activate package. Please contact support.');
                }
            } else {
                console.log("🔴 [FREE PACKAGE] merchantOrder is null");
                setLoading(false);
                console.log("🔴 [FREE PACKAGE] Loader set to FALSE");
                toast.error('Your Already have Active Package...');
            }
        } catch (error) {
            console.log('🔴 [FREE PACKAGE] Error in completeOrderInternally:', error);
            setLoading(false);
            console.log("🔴 [FREE PACKAGE] Loader set to FALSE (error)");
            toast.error('Failed to activate package. Please contact support.');
        }
    };

    const handlePackageSelection = async (packageId: number, packageAmount: number) => {

        setLoading(true);


        let finalAmount = packageAmount;
        let currentgiftCodeId = 0;

        if (couponCode) {
            console.log("🟢 [PURCHASE] Validating coupon code:", couponCode);
            const { isValid, discountedAmount, giftCodeId } = await validateCoupon(couponCode, packageId);
            if (isValid) {
                console.log("🟢 [PURCHASE] Coupon valid! Discounted amount:", discountedAmount);
                currentgiftCodeId = giftCodeId;
                finalAmount = discountedAmount;

            } else {

                setLoading(false);

                toast.error("Invalid Gift Code.");
                return;
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

            if (!merchantOrder) {

                toast.error('Your Already have Active Package...');
                setLoading(false);

                return;
            }

            let selectedPaymentMethod = "";
            const options = {
                key: merchantOrder?.razorpayPaymentId,
                amount: merchantOrder?.amount,
                currency: merchantOrder?.currency,
                name: paymentModel.name,
                description: "",
                order_id: merchantOrder?.razorpayOrderId,
                handler: async function (response: any) {
                    console.log("💳 [PAID PACKAGE] Payment completed! Response:", response);
                    setLoading(true); // Show loader during payment completion
                    console.log("💳 [PAID PACKAGE] Loader set to TRUE (payment handler)");
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
                            console.log("💳 [PAID PACKAGE] Payment verification successful");
                            const packageId = paymentModel.packageId;
                            if (packageId) {
                                console.log("💳 [PAID PACKAGE] Adding user to package...");
                                const userPackageApiModel: AddUserToPackageApiModel = {
                                    UserId: userAuth?.userId || 0,
                                    TransactionId: result.id,
                                    PackageId: paymentModel.packageId,
                                }
                                await AddUserToPackage(userPackageApiModel);
                                console.log("💳 [PAID PACKAGE] User added to package successfully");

                                console.log("💳 [PAID PACKAGE] Invalidating queries...");
                                await queryClient.invalidateQueries({ queryKey: ["userPackages"] });
                                console.log("💳 [PAID PACKAGE] Queries invalidated successfully");
                            }
                            toast.success('Payment successful! Redirecting to dashboard...');
                            console.log("💳 [PAID PACKAGE] Navigating to dashboard in 500ms...");

                            // Keep loader visible during navigation
                            setTimeout(() => {
                                console.log("💳 [PAID PACKAGE] Executing navigation now");
                                navigate("/");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }, 500);
                        } else {
                            console.log("🔴 [PAID PACKAGE] Payment verification failed");
                            setLoading(false);
                            console.log("🔴 [PAID PACKAGE] Loader set to FALSE");
                            toast.error('Payment verification failed. Please contact support.');
                        }
                    } catch (error) {
                        console.log('🔴 [PAID PACKAGE] Error completing payment:', error);
                        setLoading(false);
                        console.log("🔴 [PAID PACKAGE] Loader set to FALSE (error)");
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
                        console.log('💳 [PAID PACKAGE] Payment modal dismissed by user');
                        setLoading(false);
                        console.log("💳 [PAID PACKAGE] Loader set to FALSE (modal dismissed)");
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on("payment.submit", (response: any) => {
                selectedPaymentMethod = response.method || "Unknown";
            });
            paymentObject.open();
            setLoading(false);
        } catch (error: any) {
            toast.error(error.message || 'Unable to initialize payment. Please try again later.');
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
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
        <div>
            <Toaster />

            {isCouponDialogOpen && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
                    <div className="relative p-6 w-96 bg-white rounded-md shadow-lg">
                        <h2 className="mb-4 text-lg font-semibold">Enter Gift Code </h2>
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="p-2 w-full rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="grid grid-cols-1 gap-8">
                {packages.map((pkg) => {
                    const details = packageDetails.get(pkg.id);
                    const discountedPrice = discountedPrices[pkg.id] ?? pkg.price;
                    const hasDiscount = appliedCoupons[pkg.id] !== undefined;

                    return (
                        <div key={pkg.id} className="flex flex-col p-6 mt-5 bg-white rounded-lg shadow-md transition-transform duration-300 transform md:flex-row hover:shadow-lg">
                            <div className="flex-1 p-7">
                                <h2 className="mb-2 text-2xl font-bold">{pkg.name}</h2>
                                <p className="mb-4 text-gray-700">{pkg.description}</p>
                                <h3 className="mb-4 text-xl font-semibold">What's included:</h3>
                                <ul className="pl-5 space-y-2 list-disc text-gray-600">
                                    {details?.exams.map((exam) => (
                                        <li key={exam.id}>{exam.name}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col justify-center items-center p-4 rounded-md">
                                <div className={`transition-transform duration-500 ${hasDiscount ? "text-green-600 scale-110" : "text-secondary"}`}>
                                    {hasDiscount && (
                                        <p className="mb-1 text-sm text-gray-500 line-through">
                                            ₹ {pkg.price.toFixed(2)}
                                        </p>
                                    )}
                                    <p className="mb-2 text-3xl font-bold">
                                        ₹ {discountedPrice.toFixed(2)}
                                    </p>
                                    {hasDiscount && discountedPrice < pkg.price && (
                                        <p className="text-sm text-green-600 font-semibold">
                                            You save ₹{(pkg.price - discountedPrice).toFixed(2)}!
                                        </p>
                                    )}
                                </div>

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
        </div>
    );
};

export default AvailablePackagesSection;