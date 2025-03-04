import React, { useEffect, useRef, useState } from "react";
import { personalityDataList } from "../result/personality";
import { aptitudeDataList } from "../result/aptitude";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { ExamResultApiModel } from "../../types/result";
import { GetExamResultByExamProgressId } from "../../services/resultService";
import PersonalityCard from "./PersonalityCard";
import AptitudeCard from "./ApptitudeCard";
import PdfDownloader from "../../utils/PdfDownloader";
import PdfGenerator from "../../utils/PdfDownloader";
import { UserProfileUpdate } from "../../types/user";
import { getUserDetails } from "../../services/authService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface ExamResultRequestModel {
  examProgressIds: number[];
}

const ExamResults: React.FC<ExamResultRequestModel> = ({ examProgressIds }) => {
  const [examResult, setExamResult] = useState<{
    personalityData: ExamResultApiModel | null;
    aptitudeData: ExamResultApiModel | null;
  }>({
    personalityData: null,
    aptitudeData: null
  });

  const resultRef = useRef(null);
  const [userDetails, setUserDetails] = useState<UserProfileUpdate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const fetchedUserDetails = await getUserDetails();
        console.log(fetchedUserDetails); // Log the fetched data
        if (fetchedUserDetails) {

          setUserDetails(fetchedUserDetails); // Save the fetched data

        }
      } catch (error) {
        console.error("Error fetching user details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);
  useEffect(() => {
    const fetchExamResults = async () => {
      try {
        console.log("Fetching exam results for IDs:", examProgressIds);

        const personalityResults = await GetExamResultByExamProgressId(examProgressIds[0]);
        const aptitudeResults = await GetExamResultByExamProgressId(examProgressIds[1]);

        if (personalityResults && aptitudeResults) {
          setExamResult({
            personalityData: personalityResults,
            aptitudeData: aptitudeResults
          });
        } else {
          setError("Failed to fetch exam results.");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamResults();
  }, [examProgressIds]);

  if (loading) return <p className="text-center">Loading results...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!examResult.personalityData || !examResult.aptitudeData)
    return <p className="text-center">No data available.</p>;

  const { personalityData, aptitudeData } = examResult;

  // 🔹 **Personality Chart Data Preparation**
  const personalitySectionData = personalityData.overallStats?.sectionWiseBreakdown ?? [];

  const sortedPersonalities = [...personalitySectionData]
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);

  const personalityLabels = sortedPersonalities.map((section) => section.section);
  const personalityAccuracies = sortedPersonalities.map((section) => section.accuracy);

  console.log("Personality Chart Data:", personalityLabels, personalityAccuracies); // Debugging

  const personalityChartData = {
    labels: personalityLabels,
    datasets: [
      {
        label: "Personality Alignment Accuracy",
        data: personalityAccuracies,
        backgroundColor: ["#FF5733", "#33A1FF", "#FFC300", "#4CAF50", "#8E44AD"]
      }
    ]
  };

  const personalityChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Top 3 Personality Matches" }
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { text: "Accuracy (%)" } }
    }
  };
  // 🔹 **Aptitude Table Data**
  const aptitudeSectionData = aptitudeData.sectionWiseData ?? {};
  const aptitudeTableData = Object.entries(aptitudeSectionData).map(
    ([area, data]: [string, any]) => ({
      area,
      score: data.score,
      correctAnswers: data.correctAnswers,
      totalQuestions: data.totalQuestions
    })
  );


  return (
    <>
      <div className="self-center mx-auto text-right max-w-7xl">
        <PdfDownloader reportRef={resultRef} />
      </div>
      <div className="p-6 mx-auto mt-2 bg-white rounded-lg shadow-md max-w-7xl" ref={resultRef}>
        {/*  Student Details */}
        <div>
          <h1>Student: {userDetails?.fullName}</h1>
          <h1>Email : {userDetails?.email}</h1>
        </div>
        {/* 🧠 Personality Cards */}
        <h2 className="mt-1 mb-2 text-2xl font-bold text-center text-gray-800">Your Personality Types</h2>
        {/* 📊 Personality Chart */}
        {/* <h2 className="mb-4 text-2xl font-bold text-center text-gray-800">Top 3 Personality Matches</h2> */}
        <div className="w-2/5 p-4 mx-auto bg-white rounded-lg shadow h-1/6">
          <Bar data={personalityChartData} options={personalityChartOptions} className="bg-white" />
        </div>
        <div className="mt-3">
          {personalityLabels
            .map((label) => {
              const key = Object.keys(personalityDataList).find((k) =>
                k.toLowerCase().trim() === label.toLowerCase().trim().replace(/\t/g, '')
              );
              return key;
            })
            .filter((key): key is string => key !== undefined) // Use type guard to assert key is not undefined
            .map((key) => (
              <PersonalityCard key={key} personality={personalityDataList[key]} />
            ))}

        </div>

        {/* 📋 Aptitude Table */}
        <h2 className="mt-8 text-2xl font-bold text-center text-gray-800">Aptitude Test Results</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full overflow-hidden bg-white rounded-lg shadow">
            <thead className="bg-gray-200">
              <tr className="text-left">
                <th className="p-3">Area</th>
                <th className="p-3">Score</th>
                <th className="p-3">Correct Answers</th>
                <th className="p-3">Total Questions</th>
              </tr>
            </thead>
            <tbody>
              {aptitudeTableData.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{row.area}</td>
                  <td className="p-3">{row.score}</td>
                  <td className="p-3">{row.correctAnswers}</td>
                  <td className="p-3">{row.totalQuestions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔢 Aptitude Cards */}
        <h2 className="mt-8 text-2xl font-bold text-center text-gray-800">Your Aptitude Strengths</h2>
        <div className="mt-3">
          {Object.keys(aptitudeDataList).map((key) => (
            <AptitudeCard key={key} aptitude={aptitudeDataList[key]} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ExamResults;