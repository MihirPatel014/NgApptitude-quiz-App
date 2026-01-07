export interface SectionData {
    sectionName: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
}

export interface SectionBreakdown {
    section: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
}

export interface OverallStats {
    totalCorrectAnswers: number;
    totalQuestions: number;
    accuracyPercentage: number;
    overallScore: number;
    sectionWiseBreakdown: SectionBreakdown[];
}
export interface ScoreStats {
  totalScore: number;
  wrongAnswers: number;
  negativeMarks: number;
  finalScore: number;
}

export interface ExamResultApiModel {
    examResultId: number;
    examProgressId: number;
    userId: number;
    userName: string;      
    email: string; 
    examId: number;
    examName: string;
    //It can be Score-Based or Profile-Based for Aptitude or Personality
    resultTypeEnum: 1 | 2;
    resultType: "Score-Based" | "Profile-Based";
    score?: number;
    timeTaken?: number;
    //A dictionary with string keys and SectionData values for Aptitude or Personality
    sectionWiseData: { [key: string]: SectionData };
    overallStats?: OverallStats;
    scoreStats?: ScoreStats;
    //A dictionary with string keys and SectionData values for Personality Evaluation
    profileEvaluation?: { [key: string]: SectionData };
    createdAtUtc: string;
    updatedAtUtc: string;
}

export interface FinalResultViewModel {
    name: string;
    contactNo: string;
    email: string;
    age: number;
    birthdate: string; // ISO string format recommended (e.g., '2025-06-16')
    education: string;
  
    topAptitude1: string;
    topAptitude2: string;
  
    topPersonality1: string;
    topPersonality2: string;
  
    resultSummaries: ResultSummary[];
  
    aptitudeScores: { [key: string]: number };
    personalityScores: { [key: string]: number };
  }
  
  export interface ResultSummary {
    personalityTypes: string;
    aptitudeType: string;
    interestAreas: string;
    stream: string;
    potentialCareerFields: string;
  }
  