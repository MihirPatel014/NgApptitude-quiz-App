import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { User, BookOpen, Calendar, Phone, Mail, Award, Brain, TrendingUp, CheckCircle } from "lucide-react";
import { personalityDataList } from "./personality";
import { aptitudeDataList } from "./aptitude";
import ngLogo1 from '../../../src/assests/images/ng_logo1.jpg';
import ngLogo2 from '../../../src/assests/images/ng_logo2.png';

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
import PdfDownloader from "../../utils/PdfDownloader";
import { UserProfileUpdate } from "../../types/user";
import { getUserDetails } from "../../services/authService";
import { useLoader } from "../../provider/LoaderProvider";
import FinalResult from "./FinalResult";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ResultNew: React.FC = () => {
  const location = useLocation();
  const examId = location.state?.packageId;

  const [examResult, setExamResult] = useState<FinalResultViewModel | null>(null);
  const [userDetails, setUserDetails] = useState<UserProfileUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setLoading } = useLoader();
  const resultRef = useRef(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const res = await getUserDetails();
        if (res) setUserDetails(res);
      } catch (err) {
        console.log("Error fetching user details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!examId) {
          setError("No exam ID provided.");
          return;
        }
        const result = await GetExamResult_ByExamProgressId(examId);
        if (!result) {
          setError("Could not fetch result.");
        } else {
          setExamResult(result);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId]);

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-red-600">{error}</p>
      </div>
    );

  if (!examResult)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  const aptitudeEntries = Object.entries(examResult.aptitudeScores || {});
  const top2Aptitude = aptitudeEntries.sort((a, b) => b[1] - a[1]).slice(0, 2).map(([label]) => label);
  const aptitudeLabels = aptitudeEntries.map(([k]) => k);
  const aptitudeScores = aptitudeEntries.map(([, v]) => v);

  const aptitudeDonutData = {
    labels: aptitudeLabels,
    datasets: [
      {
        label: "Aptitude Scores",
        data: aptitudeScores,
        backgroundColor: [
          "rgba(99, 102, 241, .8)", "rgba(34, 197, 94,.8)", "rgba(251,191,36,.8)",
          "rgba(239,68,68,.8)", "rgba(168,85,247,.8)", "rgba(236,72,153,.8)"
        ],
        borderWidth: 2
      }
    ]
  };

  const aptitudeDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" as const }, title: { display: true, text: "Aptitude Types" } }
  };

  const personalityEntries = Object.entries(examResult.personalityScores || {});
  const top2Personality = personalityEntries.sort((a, b) => b[1] - a[1]).slice(0, 2);
  const topPersonalityLabels = top2Personality.map(([k]) => k);

  const personalityLabels = personalityEntries.map(([k]) => k);
  const personalityScores = personalityEntries.map(([, v]) => v);

  const personalityBarData = {
    labels: personalityLabels,
    datasets: [
      {
        label: "Personality Scores",
        data: personalityScores,
        borderRadius: 6,
        backgroundColor: [
          "rgba(99, 102,241,.8)", "rgba(34,197,94,.8)", "rgba(251,191,36,.8)",
          "rgba(239,68,68,.8)", "rgba(168,85,247,.8)"
        ]
      }
    ]
  };

  const personalityBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const }, title: { display: true, text: "Personality Types" } },
    scales: { y: { beginAtZero: true } }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-x-hidden">
      <div className="w-full px-3 md:px-6 py-6 mx-auto overflow-x-hidden">
        
        <div className="flex justify-end mb-6">
          <PdfDownloader reportRef={resultRef} />
        </div>
        
        <div ref={resultRef} className="overflow-x-hidden">
          <div className="pdf-section">
          <div className="mb-10 text-center">
            <div className="flex flex-col md:flex-row md:justify-center items-center gap-6 md:gap-16">

              <img src={ngLogo1} alt="Sahivana" className="w-20 md:w-32 h-auto" />

              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-bold text-indigo-600">Personality & Aptitude Profile</h1>
                <p className="text-gray-600 text-base md:text-lg mt-1">Discover Your Path to Success</p>
              </div>

              <img src={ngLogo2} alt="NG" className="w-16 md:w-24 h-auto" />
            </div>
          </div>       

          
          <div className="overflow-hidden bg-white rounded-2xl shadow-xl mb-10">
            <div className="px-4 md:px-8 py-6 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="text-white w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Student Profile</h2>
              </div>
            </div>

            <div className="p-4 md:p-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {[
                  { icon: User, label: "Name", value: userDetails?.fullName },
                  { icon: BookOpen, label: "Education", value: examResult?.education },
                  { icon: Calendar, label: "Date of Birth", value: examResult?.birthdate },
                  { icon: Phone, label: "Contact", value: examResult?.contactNo },
                  { icon: Mail, label: "Email", value: examResult?.email }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center bg-gray-50 rounded-xl p-4">
                    <item.icon className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="text-sm text-gray-500">{item.label}</div>
                      <div className="font-semibold text-gray-900">{item.value || "-"}</div>
                    </div>
                  </div>
                ))}

              </div>

              <div className="mt-8 p-4 md:p-6 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex gap-3">
                  <CheckCircle className="text-blue-600 w-6 h-6 flex-shrink-0" />
                  <div className="text-gray-700 leading-relaxed">
                    <p>
                      This report represents a step forward in understanding strengths and areas for growth.
                    </p>
                    <p className="mt-3 font-semibold text-gray-800">Keep striving, keep growing.</p>
                    <p className="font-bold text-indigo-700 mt-1">
                      Santvana Psychological Well-Being Centre <br />
                      National Group, India
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          </div>

          
         
          <div className="pdf-section">
            <div className="overflow-hidden bg-white rounded-2xl shadow-xl mt-10">
              
              <div className="px-4 md:px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Aptitude Assessment</h2>
                    <p className="text-green-100">Your natural abilities and potential</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-8">

                <div className="p-4 bg-green-50 border border-green-100 rounded-xl mb-6">
                  <div className="flex gap-2 items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-800">What is Aptitude?</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Aptitude is a natural ability to learn and perform tasks effectively.
                  </p>
                </div>

                <div className="flex justify-center w-full">
                  {/* Visible Chart*/}
                <div className="w-[90vw] max-w-[350px] h-[350px] block md:block">
                  <Pie data={aptitudeDonutData} options={aptitudeDonutOptions} />
                </div>

                {/* Hidden Canvas Chart*/}
                <div className="hidden pdf-only">
                  <canvas
                    id="aptitudeChart"
                    className="chart-canvas"
                    data-type="pie"
                    data-chart={JSON.stringify(aptitudeDonutData)}
                    data-options={JSON.stringify(aptitudeDonutOptions)}
                  ></canvas>
                </div>

                </div>

                <h3 className="mt-8 mb-4 text-xl font-bold text-center text-gray-800">
                  Your Aptitude Strengths
                </h3>

                <div className="grid gap-6">
                  {top2Aptitude.map((apt) => (
                    <div key={apt} className="p-6 bg-green-50 border border-green-100 rounded-xl">
                      <h3 className="text-2xl font-bold mb-4 pb-2 border-b-4">{apt}</h3>

                      <div className="mb-4">
                        <h5 className="font-semibold mb-1">Description</h5>
                        <p className="text-gray-700">{aptitudeDataList[apt]?.description?.[0]}</p>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-semibold mb-1">Key Components</h5>
                        <ul className="list-disc pl-5 text-gray-700 space-y-1">
                          {aptitudeDataList[apt]?.keyComponents?.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-1">Importance in Career</h5>
                        <ul className="list-disc pl-5 text-gray-700 space-y-1">
                          {aptitudeDataList[apt]?.importanceInCareer?.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        <div className="pdf-section">
          <div className="overflow-hidden bg-white rounded-2xl shadow-xl mt-10">

            <div className="px-4 md:px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-600">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Personality Profile</h2>
                  <p className="text-purple-100">Your personality strengths</p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8">

              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl mb-6">
                <div className="flex gap-2 items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-purple-800">What is Personality?</span>
                </div>
                <p className="text-sm text-purple-700">
                  Personality describes the traits and behaviors that influence how a person interacts and works.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {top2Personality.map(([type, score]) => (
                  <div key={type} className="p-4 bg-purple-50 border border-purple-100 text-center rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{score}</div>
                    <div className="text-gray-700 text-sm">{type}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center w-full">
                <div className="w-[90vw] max-w-[380px] h-[360px] block md:block">
            <Bar data={personalityBarData} options={personalityBarOptions} />
          </div>

          {/* Hidden Canvas Chart */}
          <div className="hidden pdf-only">
            <canvas
              id="personalityChart"
              className="chart-canvas"
              data-type="bar"
              data-chart={JSON.stringify(personalityBarData)}
              data-options={JSON.stringify(personalityBarOptions)}
            ></canvas>
          </div>
              </div>

              <h3 className="text-xl font-bold text-center mt-8 mb-4">Personality Insights</h3>

              <div className="grid gap-6">
                {topPersonalityLabels.map((label) => (
                  <div key={label} className="p-6 bg-purple-50 border border-purple-100 rounded-xl">

                    <h3 className="text-2xl font-bold mb-4 pb-2 border-b-4">{label}</h3>

                    <div className="mb-4">
                      <h5 className="font-semibold mb-1">Description</h5>
                      <p className="text-gray-700">{personalityDataList[label]?.description}</p>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-semibold mb-1">Key Components</h5>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {personalityDataList[label]?.keyCharacteristics?.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold mb-1">Importance in Career</h5>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {personalityDataList[label]?.areasForImprovement?.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>


          {examResult?.resultSummaries && (
            <div className="pdf-section">
            <div className="overflow-hidden bg-white rounded-2xl shadow-xl mt-10">
              <div className="px-4 md:px-8 py-6 bg-gradient-to-r from-indigo-500 to-blue-600">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Award className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Career Recommendations</h2>
                </div>
              </div>

           <div className="p-4 md:p-8">
            <div className="overflow-x-auto w-full">
              <div className="min-w-[500px] sm:min-w-full">
                <FinalResult resultSummaries={examResult.resultSummaries} />
              </div>
            </div>
          </div>

            </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResultNew;
