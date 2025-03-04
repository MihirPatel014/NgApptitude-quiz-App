import React from "react";
import { Aptitude } from "./aptitude"; // Adjust the import path as needed

interface AptitudeCardProps {
  aptitude: Aptitude;
}

const AptitudeCard: React.FC<AptitudeCardProps> = ({ aptitude }) => {
  return (
    <div className="w-full p-5 mb-5 border border-gray-300 rounded-lg bg-gray-50">
      {/* Title */}
      <h2 className="text-2xl font-bold text-blue-600 underline">{aptitude.title}</h2>

      {/* Description */}
      {aptitude.description.map((desc, index) => (
        <p className="mt-2 text-pretty" key={index}>{desc}</p>
      ))}

      {/* Key Components */}
      <h3 className="mt-4 text-lg font-semibold">Key Components:</h3>
      <ul className="mt-1">
        {aptitude.keyComponents.map((component, index) => {
          const [boldText, ...rest] = component.split(": ");
          return (
            <li key={index}>
              <strong className="font-semibold">{boldText}:</strong> {rest.join(": ")}
            </li>
          );
        })}
      </ul>

      {/* Importance in Career */}
      <h3 className="mt-4 font-semibold">Importance in Career:</h3>
      {aptitude.importanceInCareer.map((importance, index) => (
        <p className="mt-2 text-pretty" key={index}>{importance}</p>
      ))}
    </div>
  );
};

export default AptitudeCard;
