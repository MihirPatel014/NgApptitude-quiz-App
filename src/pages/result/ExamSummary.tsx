import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { User, Award, BookOpen } from "lucide-react";
import { getUserDetails } from "../../services/authService";
import { GetExamResultByExamProgressId } from "../../services/resultService";
import { useLoader } from "../../provider/LoaderProvider";
import { UserProfileUpdate } from "../../types/user";
import { ExamResultApiModel } from "../../types/result";
import PdfDownloader from "../../utils/PdfDownloader";

const ExamSummary: React.FC = () => {
  const location = useLocation();
  const examProgressId = location.state?.examProgressId;
  const { setLoading } = useLoader();

  const resultRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<UserProfileUpdate | null>(null);
  const [result, setResult] = useState<ExamResultApiModel | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const res = await getUserDetails();
        setUser(res ?? null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadResult = async () => {
      if (!examProgressId) return;
      setLoading(true);
      try {
        const res = await GetExamResultByExamProgressId(examProgressId);
        setResult(res ?? null);
      } finally {
        setLoading(false);
      }
    };
    loadResult();
  }, [examProgressId]);

  if (!user || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-b-2 border-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const sections = Object.values(result.sectionWiseData ?? {});
  const stats = result.scoreStats;

  /*TOTAL CALCULATIONS*/
  const totalScore = sections.reduce((s: number, x: any) => s + x.score, 0);
  const totalCorrect = sections.reduce((s: number, x: any) => s + x.correctAnswers, 0);
  const totalQuestions = sections.reduce((s: number, x: any) => s + x.totalQuestions, 0);
  const totalWrong = totalQuestions - totalCorrect;

  const overallAccuracy =
    totalCorrect + totalWrong > 0
      ? ((totalCorrect / (totalCorrect + totalWrong)) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
     
      {/* PDF CONTENT */}
      {/* PDF CONTENT */}
<div ref={resultRef}>

  {/* STUDENT DETAILS */}
  <div className="pdf-section">
    <div className="bg-white rounded-xl shadow p-6 mb-8">

      {/* Header with PDF button on right */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Student Details
          </h2>
        </div>

        {/* PDF DOWNLOAD BUTTON */}
        <PdfDownloader reportRef={resultRef} />
      </div>

      <Grid cols={3}>
        <Info label="Name" value={result.userName} />
        <Info label="Email" value={result.email} />
        <Info label="Exam Name" value={result.examName} />
        <Info label="Time Taken (min)" value={result.timeTaken ?? "-"} />
      </Grid>
    </div>

  {/* OVERALL SUMMARY */}
    <Section title="Overall Performance" icon={Award}>
      <Grid cols={4}>
        <Stat label="Final Score" value={stats?.finalScore} />
        <Stat label="Total Score" value={stats?.totalScore} />
        <Stat label="Wrong Answers" value={stats?.wrongAnswers} />
        <Stat label="Negative Marks" value={stats?.negativeMarks} />
      </Grid>
    </Section>

  {/* SECTION WISE PERFORMANCE */}
    <Section title="Section Wise Performance" icon={BookOpen}>
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Section</th>
              <th className="p-3 text-center">Score</th>
              <th className="p-3 text-center">Correct</th>
              <th className="p-3 text-center">Wrong</th>
              <th className="p-3 text-center">Accuracy (%)</th>
              <th className="p-3 text-center">Total</th>
            </tr>
          </thead>

          <tbody>
            {sections.map((s: any) => {
              const wrong = s.totalQuestions - s.correctAnswers;
              const accuracy =
                s.correctAnswers + wrong > 0
                  ? ((s.correctAnswers / (s.correctAnswers + wrong)) * 100).toFixed(2)
                  : "0.00";

              const accuracyColor =
                Number(accuracy) >= 75
                  ? "text-green-700"
                  : Number(accuracy) >= 40
                  ? "text-yellow-600"
                  : "text-red-600";

              return (
                <tr key={s.sectionName} className="border-t">
                  <td className="p-3 font-semibold">{s.sectionName}</td>

                  <td className="p-3 text-center font-semibold text-indigo-600">
                    {s.score}
                  </td>

                  <td className="p-3 text-center font-semibold text-green-600">
                    {s.correctAnswers}
                  </td>

                  <td className="p-3 text-center font-semibold text-red-600">
                    {wrong}
                  </td>

                  <td className={`p-3 text-center font-bold ${accuracyColor}`}>
                    {accuracy}%
                  </td>

                  <td className="p-3 text-center">
                    {s.totalQuestions}
                  </td>
                </tr>
              );
            })}

            {/* TOTAL ROW */}
            <tr className="bg-indigo-100 border-t-2 font-bold">
              <td className="p-3">TOTAL</td>
              <td className="p-3 text-center text-indigo-700">{totalScore}</td>
              <td className="p-3 text-center text-green-700">{totalCorrect}</td>
              <td className="p-3 text-center text-red-700">{totalWrong}</td>
              <td className="p-3 text-center text-indigo-800">
                {overallAccuracy}%
              </td>
              <td className="p-3 text-center">{totalQuestions}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  </div>

</div>

    </div>
  );
};

export default ExamSummary;

/*HELPERS */

const Section = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white rounded-xl shadow p-6 mb-8">
    <div className="flex items-center gap-3 mb-6">
      <Icon className="text-indigo-600" />
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const Grid = ({ children, cols = 3 }: any) => {
  const colClass =
    cols === 4 ? "md:grid-cols-4" :
    cols === 3 ? "md:grid-cols-3" :
    "md:grid-cols-2";

  return <div className={`grid grid-cols-1 ${colClass} gap-4`}>{children}</div>;
};

const Info = ({ label, value }: any) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold">{value ?? "-"}</p>
  </div>
);

const Stat = ({ label, value }: any) => (
  <div className="bg-indigo-50 p-4 rounded-lg text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-indigo-700">{value ?? "-"}</p>
  </div>
);
