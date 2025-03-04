import React from "react";
import { Personality } from "./personality"; // Adjust the import path as needed

interface PersonalityCardProps {
  personality: Personality;
}

const PersonalityCard: React.FC<PersonalityCardProps> = ({ personality }) => {
  return (
    <div className="p-5 mb-5 border border-gray-300 rounded-lg bg-gray-50">
      {/* Title */}
      <h2 className="text-2xl font-bold text-orange-600 underline">{personality.title}</h2>

      {/* Description */}
      {personality.description.map((desc, index) => (
        <p className="mt-2 text-pretty" key={index}>{desc}</p>
      ))}

      {/* Key Characteristics */}
      <h3 className="mt-4 text-xl font-semibold">Key Characteristics:</h3>
      <ul className="mt-1">
        {personality.keyCharacteristics.map((char, index) => {
          const [boldText, ...rest] = char.split(": ");
          return (
            <li key={index} className="mr-2">
              <strong className="mr-1">{boldText}:</strong> {rest.join(": ")}
            </li>
          );
        })}
      </ul>

      {/* Areas for Improvement */}
      <h3 className="mt-4 text-xl font-semibold">Areas for Improvement:</h3>
      <ul className="mt-1">
        {personality.areasForImprovement.map((area, index) => {
          const [boldText, ...rest] = area.split(": ");
          return (
            <li key={index} >
              <strong className="mr-1">{boldText}:</strong> <em className="italic">{rest.join(": ")}</em>
            </li>
          );
        })}
      </ul>

      {/* Guiding Values */}
      <h3 className="mt-4 text-xl font-semibold">Your Guiding Values</h3>
      <ul>
        {personality.guidingValues.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </div>
  );
};

export default PersonalityCard;
