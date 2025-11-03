import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { User, BookOpen, Calendar, Phone, Mail, Award, Brain, TrendingUp, Download, CheckCircle } from "lucide-react";
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

const ResultNew: React.FC = () => {
  const location = useLocation();
  const examId = location.state?.packageId;
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
        console.log("Error fetching user details", error);
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
  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-2 text-xl text-red-500">⚠️</div>
        <p className="font-medium text-red-600">{error}</p>
      </div>
    </div>
  );

  if (!examResult) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full border-b-2 border-indigo-600 animate-spin"></div>
        <p className="text-gray-600">Loading your results...</p>
      </div>
    </div>
  );

  // Prepare chart data
  const aptitudeEntries = Object.entries(examResult.aptitudeScores || {});
  const top2Aptitude = aptitudeEntries.sort((a, b) => b[1] - a[1]).slice(0, 2).map(([label]) => label);; // Keep all entries
  // const top2AptitudeLabels = top2Aptitude.map(([label]) => label); // Use all labels
  const AptitudeLabels = aptitudeEntries.map(([k]) => k);
  const AptitudeScores = aptitudeEntries.map(([, v]) => v);

  const aptitudeDonutData = {
    labels: AptitudeLabels, // Use all aptitude labels
    datasets: [
      {
        label: "Aptitude Scores",
        data: AptitudeScores, // Use all aptitude scores
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          // Add more colors if there are more than 5 aptitude types
          "rgba(236, 72, 153, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(217, 70, 239, 0.8)"
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(168, 85, 247, 1)",
          // Add more border colors accordingly
          "rgba(236, 72, 153, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(217, 70, 239, 1)"
        ],
        borderWidth: 2,
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
  const top2personalityLabels = top2Personality.map(([k]) => k);;// Keep all entries
  const PersonalityLabels = personalityEntries.map(([k]) => k); // Use all labels
  const PersonalityScores = personalityEntries.map(([, v]) => v); // Use all scores

  const personalityBarData = {
    labels: PersonalityLabels, // Use all personality labels
    datasets: [
      {
        label: "Personality Scores",
        data: PersonalityScores, // Use all personality scores
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          // Add more colors if there are more than 5 personality types
          "rgba(236, 72, 153, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(217, 70, 239, 0.8)"
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(168, 85, 247, 1)",
          // Add more border colors accordingly
          "rgba(236, 72, 153, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(217, 70, 239, 1)"
        ],
        borderWidth: 2,
        borderRadius: 8,
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
        text: "Personality Types", // Updated title
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

  const mystyle = {
    // page_break_before: "always",
    pageBreakBefore: "always",
  };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          {/* Download Button */}
          <div className="flex justify-end mb-6">
            <PdfDownloader reportRef={resultRef} />
          </div>

          <div ref={resultRef}>
            <div className="pdf-section">


              {/* Header Section */}
              <div className="mb-12 text-center" >
                <div className="flex gap-12 justify-center items-center mb-6">
                  <div>
                    <img src={ngLogo1} alt="Sahivana" className="w-36 h-24" />
                  </div>

                  <div>
                    <h1 className="text-4xl font-bold text-indigo-600 md:text-5xl">
                      Personality and Aptitude Profile
                   </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
                      Discover Your Path to Success
                    </p>
                  </div>
                  <div>

                    <img src={ngLogo2} alt="National Group" className="h-20" />
                  </div>
                </div>

              </div>

              {/* Student Profile Card */}
              <div className="overflow-hidden mb-8 bg-white rounded-2xl border-0 shadow-xl">
                <div className="px-8 py-6 bg-gradient-to-r from-indigo-500 to-purple-600">
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center w-12 h-12 rounded-full bg-white/20">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Student Profile</h2>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl">
                      <User className="w-5 h-5 text-indigo-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Name</div>
                        <div className="font-semibold text-gray-900">{userDetails?.fullName || "-"}</div>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Education</div>
                        <div className="font-semibold text-gray-900">{examResult?.education || "-"}</div>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                        <div className="font-semibold text-gray-900">{examResult?.birthdate || "-"}</div>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Contact</div>
                        <div className="font-semibold text-gray-900">{examResult?.contactNo || "-"}</div>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <div className="font-semibold text-gray-900">{examResult?.email || "-"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex gap-3 items-start">
                      <CheckCircle className="flex-shrink-0 mt-1 w-6 h-6 text-blue-600" />
                      <div>
                        <p className="leading-relaxed text-gray-700">
                          We extend our heartfelt congratulations to all the students who participated in the recent Aptitude Test. This report is more than just a summary of scores—it is a celebration of curiosity, determination, and potential.
                        </p>
                        <p className="mt-3 leading-relaxed text-gray-700">
                          Each result represents a step forward in understanding individual strengths and areas for growth. Remember, aptitude is not a measure of worth, but a tool to help uncover the paths where each student can thrive.
                        </p>
                        <p className="mt-3 font-semibold text-gray-800">
                          Keep striving, keep growing.
                        </p>
                        <p className="mt-2 font-bold text-indigo-700">
                          Santvana Psychological Well-Being Centre<br />
                          National Group, India
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Assessment Results Grid */}
            <div className="grid gap-8 mb-8" >
              <div className="pdf-section">
                {/* Aptitude Test Results */}
                <div className="overflow-hidden bg-white rounded-2xl border-0 shadow-xl">
                  <div className="px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600">
                    <div className="flex gap-4 items-center">
                      <div className="flex justify-center items-center w-12 h-12 rounded-full bg-white/20">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Aptitude Assessment </h2>
                        <p className="text-green-100">Your natural abilities and potential</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="p-4 mb-6 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex gap-2 items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-800">What is Aptitude?</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Aptitude refers to an individual's natural ability or talent to learn and perform specific tasks or skills. In the context of a career, aptitude encompasses the capabilities that enable a person to succeed in certain job functions or fields.
                      </p>
                    </div>

                    <div className="flex justify-center h-80">
                      <Pie data={aptitudeDonutData} options={aptitudeDonutOptions} />
                    </div>

                    <h3 className="mt-8 mb-4 text-xl font-bold text-center text-gray-800">Your Aptitude Strengths</h3>
                    <div className="grid gap-6 md:grid-cols-1">
                      {top2Aptitude.map((apt) => (
                        <div key={apt} className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 transition-all hover:shadow-md">
                          <div>
                            <h3 className="pb-2 mb-5 text-2xl font-bold border-b-4">{apt}</h3>
                          </div>
                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold">Description</h5>
                            <p className="text-gray-700">
                              {aptitudeDataList[apt]?.description?.[0] || "A key strength in your aptitude profile."}
                            </p>
                          </div>

                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold">Key Components</h5>
                            <ul className="pl-5 space-y-2 list-disc text-gray-700">
                              {aptitudeDataList[apt]?.keyComponents?.map((component, index) => (
                                <li key={index}>{component}</li>
                              )) || <li>No key components available</li>}
                            </ul>
                          </div>

                          <div>
                            <h5 className="mb-2 font-semibold">Importance in Career</h5>
                            <ul className="pl-5 space-y-2 list-disc text-gray-700">
                              {aptitudeDataList[apt]?.importanceInCareer?.map((importance, index) => (
                                <li key={index}>{importance}</li>
                              )) || <li>No career importance information available</li>}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pdf-section">
                {/* Personality Results */}
                <div className="overflow-hidden bg-white rounded-2xl border-0 shadow-xl">
                  <div className="px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-600">
                    <div className="flex gap-4 items-center">
                      <div className="flex justify-center items-center w-12 h-12 rounded-full bg-white/20">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Personality Profile</h2>
                        <p className="text-purple-100">Your top personality strengths</p>
                      </div>
                    </div>
                  </div>


                  <div className="p-8">
                    <div className="p-4 mb-6 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="flex gap-2 items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-purple-800">What is Personality?</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        Personality refers to the unique set of traits, characteristics, and behaviors that define an individual. In the context of career, personality influences how a person approaches work, interacts with others, and makes decisions about their professional life.
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {top2Personality.map(([type, score], index) => (<div key={type}
                          className="p-4 text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                          <div className="text-2xl font-bold text-purple-600">{score}</div>
                          <div className="text-sm font-medium text-gray-700">{type}</div>
                        </div>))}
                      </div>
                    </div>

                    <div className="flex justify-center h-64">
                      <Bar data={personalityBarData} options={personalityBarOptions} />
                    </div>

                    <h3 className="mt-8 mb-4 text-xl font-bold text-center text-gray-800">Personality Insights</h3>
                    <div className="grid gap-4">
                      {top2personalityLabels.map((pers, index) => (
                        <div key={pers} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 transition-all hover:shadow-md">

                          {/* <h4 className="mb-2 text-lg font-bold text-purple-700">{pers}</h4>
                        <p className="text-sm text-gray-700">
                          {personalityDataList[pers]?.description || "A key aspect of your personality profile."}
                        </p>
                      </div> */}
                          <div>
                            <h3 className="pb-2 mb-5 text-2xl font-bold border-b-4">{pers}</h3>
                          </div>
                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold">Description</h5>
                            <p className="text-gray-700">
                              {personalityDataList[pers]?.description || "A key aspect of your personality profile."}
                            </p>
                          </div>

                          <div className="mb-4">
                            <h5 className="mb-2 font-semibold">Key Components</h5>
                            <ul className="pl-5 space-y-2 list-disc text-gray-700">
                              {personalityDataList[pers]?.keyCharacteristics?.map((component, index) => (
                                <li key={index}>{component}</li>
                              )) || <li>No key components available</li>}
                            </ul>
                          </div>

                          <div>
                            <h5 className="mb-2 font-semibold">Importance in Career</h5>
                            <ul className="pl-5 space-y-2 list-disc text-gray-700">
                              {personalityDataList[pers]?.areasForImprovement?.map((importance, index) => (
                                <li key={index}>{importance}</li>
                              )) || <li>No career importance information available</li>}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Results Summary */}
            {examResult && examResult.resultSummaries && (
              <div className="overflow-hidden bg-white rounded-2xl border-0 shadow-xl">
                <div className="px-8 py-6 bg-gradient-to-r from-indigo-500 to-blue-600">
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center w-12 h-12 rounded-full bg-white/20">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Career Recommendations</h2>
                  </div>
                </div>
                <div className="pdf-section">
                  <div className="p-8">
                    <FinalResult resultSummaries={examResult.resultSummaries} />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ResultNew;