import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { personalityDataList } from "./personality";
import { aptitudeDataList } from "./aptitude";
import ngLogo1 from '../../../src/assests/images/ng_logo1.jpg';
import ngLogo2 from '../../../src/assests/images/ng_logo2.png';
import personalityChart from '../../../src/assests/images/personality_chart.png';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { FinalResultViewModel } from "../../types/result";
import { GetExamResult_ByExamProgressId } from "../../services/resultService";
import PersonalityCard from "./PersonalityCard";
import AptitudeCard from "./ApptitudeCard";
import PdfDownloader from "../../utils/PdfDownloader";
import { UserProfileUpdate } from "../../types/user";
import { getUserDetails } from "../../services/authService";
import { useLoader } from "../../provider/LoaderProvider";
import FinalResult from "./FinalResult";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Result: React.FC = () => {
  const location = useLocation();
  const examId = location.state?.examId;
  const [examResult, setExamResult] = useState<FinalResultViewModel | null>(null);
  const resultRef = useRef(null);
  const { setLoading } = useLoader();
  const [userDetails, setUserDetails] = useState<UserProfileUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const fetchedUserDetails = await getUserDetails();
        if (fetchedUserDetails) {
          setUserDetails(fetchedUserDetails);
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
      setLoading(true);
      try {
        if (!examId) {
          setError("No exam ID provided.");
          setLoading(false);
          return;
        }
        const result = await GetExamResult_ByExamProgressId(examId);
        if (result) {
          setExamResult(result);
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
  }, [examId, setLoading]);

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!examResult) return <p className="text-center">No data available.</p>;

  const aptitudeEntries = Object.entries(examResult.aptitudeScores || {});
  const top2Aptitude = aptitudeEntries.sort((a, b) => b[1] - a[1]).slice(0, 2);
  const top2AptitudeLabels = top2Aptitude.map(([label]) => label);
  const AptitudeLabels = aptitudeEntries.map(([k]) => k);
  const AptitudeScores = aptitudeEntries.map(([, v]) => v);
  const aptitudeDonutData = {
    labels: AptitudeLabels,
    datasets: [
      {
        label: "Top Aptitude Scores",
        data: AptitudeScores,
        backgroundColor: ["#4FFFB0", "#FFC300", "#3CB371", "#8FBC8B", "#32de84"],
      }
    ]
  };
  const aptitudeDonutOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" as const },
      title: { display: true, text: "Aptitude Types" }
    }
  };

  const personalityEntries = Object.entries(examResult.personalityScores || {});
  const top2Personality = personalityEntries.sort((a, b) => b[1] - a[1]).slice(0, 2);
  const top2PersonalityLabels = top2Personality.map(([k]) => k);
  const top2PersonalityScores = top2Personality.map(([, v]) => v);

  const personalityBarData = {
    labels: top2PersonalityLabels,
    datasets: [
      {
        label: "Top Personality Scores",
        data: top2PersonalityScores,
        backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const personalityBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Top 2 Personality Types",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
    },
  };

  return (
    <>
      <div className="flex justify-end mx-auto max-w-7xl">
        <PdfDownloader reportRef={resultRef} />
      </div>
      <div className="p-6 mx-auto mt-4 bg-white shadow-lg rounded-xl hover:shadow-xl max-w-7xl" ref={resultRef}>
        
        <div className="flex items-center justify-between py-4 border-b">
          <img src={ngLogo1} alt="nglogo1" className="h-16" />
          <h2 className="text-2xl font-bold text-center text-green-800">Career Guidance Assessment Results</h2>
          <img src={ngLogo2} alt="nglogo2" className="h-16" />
        </div>
 
        <div className="px-8 mt-8 transition-shadow bg-gray-100 rounded-lg shadow-md hover:shadow-lg">
          <h3 className="py-4 text-lg font-semibold text-gray-700 border-b">Student Profile</h3>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div><strong>Name:</strong> {userDetails?.fullName || "-"}</div>
            <div><strong>Education:</strong> {examResult?.education || "-"}</div>
            <div><strong>DOB:</strong> {examResult?.birthdate || "-"}</div>
            <div><strong>Contact No:</strong> {examResult?.contactNo || "-"}</div>
            <div><strong>Age:</strong> {examResult?.birthdate || "-"}</div>
            <div><strong>Email:</strong> {examResult?.email || "-"}</div>
          </div>
        </div>

        <div className="mt-4 text-base leading-relaxed text-justify">
          <p className="mt-2 font-bold">We extend our heartfelt congratulations to all the students who participated in the recent Aptitude Test. This report is more than just a summary of scores—it is a celebration of curiosity, determination, and potential. </p>
          <p className="mt-2 font-bold">Each result represents a step forward in understanding individual strengths and areas for growth. Remember, aptitude is not a measure of worth, but a tool to help uncover the paths where each student can thrive. </p>
          <p className="mt-2 font-bold">We are proud of every student’s effort and encourage them to view this as a foundation for future learning and personal discovery. </p>
          
          
          <p className="mt-2 font-bold">Keep striving, keep growing. </p>
          <p className="mt-2 font-bold text-green-800">Santvana Psychological Well-Being Centre<br />National Group, India</p>
        </div>

        <h1 className="mt-10 text-2xl font-bold text-center text-gray-800">What is Aptitude?</h1>
        <p className="mt-2 text-center">Aptitude refers to an individual’s natural ability to learn and perform tasks.</p>

        <div className="w-full max-w-lg p-4 mx-auto mt-4 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg">
          <Pie data={aptitudeDonutData} options={aptitudeDonutOptions} />
        </div>

        <h2 className="mt-8 text-2xl font-bold text-center text-gray-800">Your Aptitude Strengths</h2>
        <div className="flex justify-center mt-4 space-x-4">
          {top2AptitudeLabels.map((apt) => (
            <AptitudeCard key={apt} aptitude={aptitudeDataList[apt]} />
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold text-center text-gray-800">Your Personality Types</h2>
        <p className="mt-2 text-center">Personality traits significantly impact career paths.</p>
        <div className="w-full max-w-lg p-4 mx-auto mt-4 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg">
          <Bar data={personalityBarData} options={personalityBarOptions} />
        </div>

        <div className="flex justify-center mt-4 space-x-4">
          {top2PersonalityLabels.map((pers) => (
            <PersonalityCard key={pers} personality={personalityDataList[pers]} />
          ))}
        </div>

        {examResult && examResult.resultSummaries && (
          <div className="mt-10">
            <FinalResult resultSummaries={examResult.resultSummaries} />
          </div>
        )}
      </div>
    </>
  );
}

export default Result;