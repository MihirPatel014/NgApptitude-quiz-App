import React from 'react';


import rajveesignature from '../../../src/assests/images/rajvee_signature.png';
import poonamsignature from '../../../src/assests/images/poonam_signature.png';
interface ResultSummary {
  personalityTypes: string;
  aptitudeType: string;
  interestAreas: string;
  stream: string;
  potentialCareerFields: string;
}

interface FinalResultProps {
  resultSummaries: ResultSummary[];
}

const FinalResult: React.FC<FinalResultProps> = ({ resultSummaries }) => {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold text-blue-600 underline">Your Result Summary</h2>
      {resultSummaries.map((summary, index) => (
        <div key={index} className="p-4 mb-6 border border-gray-300 rounded-lg bg-gray-50">
          <table className="w-full border border-collapse border-gray-400">
            <thead>
              <tr>
                <th className="p-2 text-left bg-gray-100 border border-gray-300">Strong Aptitude area</th>
                <th className="p-2 text-left bg-gray-100 border border-gray-300">Personality types</th>
                <th className="p-2 text-left bg-gray-100 border border-gray-300">Interest Areas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-gray-300">{summary.aptitudeType}</td>
                <td className="p-2 border border-gray-300">{summary.personalityTypes}</td>
                <td className="p-2 border border-gray-300">
                  <table className="w-full">
                    <tbody>
                      {summary.interestAreas.split(', ').map((area, i) => (
                        <tr key={i}>
                          <td className="py-1">{area}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4">
            <h3 className="font-semibold text-red-600">Potential Career Fields:</h3>
            <table className="w-full mt-1 border-none">
              <tbody >
                {summary.potentialCareerFields.split(', ').map((field, i) => (
                  <tr key={i}>
                    <td className="w-8 p-2 text-center bg-gray-50">-</td>
                    <td className="p-2 ">{field}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      ))}

      {/* Added disclaimer and footer section from the image */}
      <div className="p-6 mt-8 border border-gray-300 rounded-lg bg-gray-50">
        <div className="mb-4">
          <h3 className="text-lg font-bold">Note:</h3>
          <ul className="pl-8 space-y-2 list-disc">
            <li>This is a preliminary aptitude assessment. For a more thorough and comprehensive analysis, we recommend undertaking a detailed evaluation.</li>
            <li>Following the recommendations can greatly elevate the potential for success and long-term satisfaction in the chosen career.</li>
          </ul>
        </div>

        <div className="my-6 text-center">
          <p className="italic font-medium text-green-700">
            "Wishing you a future filled with success and endless possibilities in the career you choose!"
          </p>
        </div>

        <div className="flex justify-between mt-8">
          <div className="flex flex-col">
            <div className="h-12 mb-2">
              {/* Signature placeholder */}
              <div className="italic text-indigo-400">
                <img
                  src={poonamsignature}
                  alt="signature"
                  className="w-full mb-4 mr-2 rounded-lg md:w-2/5" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-red-700">Ms. Poonam Vipani</p>
              <p className="text-green-700">Associate Clinical Psychologist</p>
              <p className="text-green-700">A105297 | RCI Registered</p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="h-12 mb-2">
              {/* Signature placeholder */}
              <div className="italic text-indigo-400">

                <img
                  src={rajveesignature}
                  alt="signature"
                  className="w-full mb-4 mr-2 rounded-lg md:w-2/5" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-red-700">Ms. Rajvee Shah</p>
              <p className="text-green-700">Psychologist</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalResult;
