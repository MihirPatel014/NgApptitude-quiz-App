import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../provider/UserProvider";
import { GetUserPackageInfoByUserId } from "../../services/authService";
import { UserPackageInfoModel, UserExamInfoModel } from "../../types/user";
import { useNavigate } from "react-router-dom";
import { FaCircle } from "react-icons/fa";
import { formatDate } from "../../utils/dateUtils";
import { useLoader } from "../../provider/LoaderProvider";

export const Subscription = () => {
    const { userAuth } = useContext(UserContext);
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [userPackages, setUserPackages] = useState<UserPackageInfoModel[]>([]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            try {
                const response = await GetUserPackageInfoByUserId(userAuth?.userId || 0);
                if (response) {
                    // Sort packages by startedDate (latest first)
                    const sortedPackages = response.sort((a: UserPackageInfoModel, b: UserPackageInfoModel) =>
                        new Date(b.startedDate || 0).getTime() - new Date(a.startedDate || 0).getTime()
                    );

                    setUserPackages(sortedPackages);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userAuth?.userId]);

    const handleResult = (packageId: number, exams: UserExamInfoModel[]) => {
        const examProgressIds = exams.filter(exam => exam.isCompleted).map(exam => exam.examProgressId);
        navigate("/result", { state: { examProgressIds } });
    };

    return (
        <div className="flex flex-col min-h-0 p-6 mx-auto mt-20 mb-5 bg-white rounded-lg shadow-md max-w-7xl">
            {userPackages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <p className="mb-4 text-lg font-semibold text-gray-600">You have no active subscriptions.</p>
                    <button
                        className="px-6 py-3 text-white bg-green-500 rounded-lg hover:bg-green-600"
                        onClick={() => navigate("/packages")}
                    >
                        Buy New Package
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-2xl font-semibold">My Subscriptions</h3>
                            <p className="text-gray-600">Here is a list of packages/products that you have subscribed to.</p>
                        </div>
                        <button
                            className="px-5 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                            onClick={() => navigate("/packages")}
                        >
                            Buy New Package
                        </button>
                    </div>

                    <div className="flex justify-end px-5 py-2">
                        <span className="flex items-center px-1 text-xs">
                            <FaCircle className="mr-1 text-green-500" /> Completed
                        </span>
                        <span className="flex items-center px-1 text-xs">
                            <FaCircle className="mr-1 text-yellow-500" /> In Progress
                        </span>
                    </div>

                    <div className="py-5 space-y-6">
                        {userPackages.map((pkg) => {
                            const allExamsCompleted = pkg.exams.length > 0 && pkg.exams.every(exam => exam.isCompleted);

                            return (
                                <div key={pkg.userPackageId && (pkg.completionDate?.toString() || "")} className="p-5 border rounded-lg shadow-sm">
                                    {allExamsCompleted && (
                                        <div className="flex justify-end">

                                            <button
                                                onClick={() => handleResult(pkg.packageId, pkg.exams)}
                                                className="px-4 py-2 text-sm text-blue-500 border border-blue-500 rounded hover:bg-blue-500 hover:text-white"
                                            >
                                                View Result
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-4">
                                        {/* Left Side: Package Info */}
                                        <div className="w-1/2">
                                            <h4 className="text-xl font-semibold">
                                                {pkg.packageName}
                                                <span className={`px-3 ml-1 py-2 text-xs rounded-full text-white ${pkg.isCompleted ? "bg-red-500" : "bg-green-500"}`}>
                                                    {pkg.isCompleted ? "Ended" : "Active"}
                                                </span>
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-500">
                                                <span className="mt-1 text-sm text-gray-500">

                                                    Billing On: {formatDate(pkg.startedDate || "")}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-500">Price: {pkg.packagePrice || "N/A"}</p>
                                            {/* <p className="text-sm text-gray-500">
                                            Status: {pkg.status} ({pkg.completionPercentage}% completed)
                                        </p> */}
                                        </div>

                                        {/* Right Side: Related Exams */}
                                        <div className="w-1/2">
                                            <h5 className="mb-2 text-lg font-semibold">Exams Included:</h5>
                                            <ul className="space-y-2">
                                                {pkg.exams.map((exam) => (
                                                    <li key={exam.examId && exam.examName} className="flex items-center justify-between p-3 bg-gray-100 rounded">
                                                        <span>{exam.examName}</span>
                                                        <span className={`px-2 py-1 text-xs rounded-full text-white ${exam.isCompleted ? "bg-green-500" : "bg-yellow-500"}`}>
                                                            {exam.isCompleted ? "Completed" : "Pending"}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default Subscription;
