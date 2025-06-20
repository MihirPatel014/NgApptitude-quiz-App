export interface Aptitude {
    title: string;
    description: string[];
    keyComponents: string[];
    importanceInCareer: string[];
}

export interface AptitudeResultSummary {
    personalityTypes: string;
    aptitudeType: string;
    interestAreas: string;
    stream: string;
    potentialCareerFields: string;
}

export interface AptitudeApiModel {
    name: string;
    contactNo: string;
    email: string;
    age: number;
    birthdate: string | null;
    education: string | null;
    topAptitude1: string;
    topAptitude2: string;
    topPersonality1: string;
    topPersonality2: string;
    resultSummaries: AptitudeResultSummary[];
    aptitudeScores: Record<string, number>;
    personalityScores: Record<string, number>;
}

export const aptitudeDataList: Record<string, Aptitude> = {
    "Spatial reasoning": {
        title: "Spatial Reasoning",
        description: [
            "Spatial reasoning refers to the ability to visualize and manipulate objects in a three-dimensional space. It involves understanding how objects relate to one another in terms of space, orientation, and movement."
        ],
        keyComponents: [
            "Mental Rotation: The ability to rotate objects in one’s mind to understand how they would appear from different angles.",
            "Spatial Orientation: Understanding the position of an object relative to oneself or other objects.",
            "Visualization: The capacity to create mental images of objects and their transformations."
        ],
        importanceInCareer: [
            "Spatial reasoning is crucial in fields where visualizing complex structures and relationships is essential. Strong spatial reasoning skills can enhance problem-solving abilities and creativity in these disciplines."
        ]
    },
    "Verbal Ability": {
        title: "Verbal Reasoning",
        description: [
            "Verbal reasoning is the ability to understand, analyse, and interpret written information. It involves comprehension of language and the ability to think logically using words."
        ],
        keyComponents: [
            "Vocabulary Knowledge: Understanding the meaning of words and their relationships.",
            "Reading Comprehension: The ability to understand and analyse written passages, drawing inferences and conclusions.",
            "Logical Reasoning: The capacity to assess arguments, identify assumptions, and evaluate the validity of statements."
        ],
        importanceInCareer: [
            "Verbal reasoning is vital in careers that require strong communication skills. Professionals in these fields must be able to articulate ideas clearly, understand complex texts, and engage in persuasive communication."
        ]
    },
    "Numerical Aptitude": {
        title: "Numerical Reasoning",
        description: [
            "Numerical reasoning is the ability to understand, interpret, and analyse numerical data. It involves working with numbers, performing calculations, and interpreting quantitative information."
        ],
        keyComponents: [
            "Basic Arithmetic: Proficiency in addition, subtraction, multiplication, and division.",
            "Data Interpretation: The ability to read and analyse graphs, charts, and tables to extract meaningful information.",
            "Problem Solving: Applying mathematical concepts to solve real-world problems."
        ],
        importanceInCareer: [
            "Numerical reasoning is essential in fields where quantitative data plays a significant role. Strong numerical skills enable professionals to make informed decisions based on data analysis and statistical inference."
        ]
    },
    "Form Perception": {
        title: "Form Perception",
        description: [
            "Form perception refers to the ability to recognize and identify shapes, patterns, and designs. It involves visual discrimination and the ability to perceive objects as they relate to one another in terms of shape and size."
        ],
        keyComponents: [
            "Shape Recognition: Identifying and distinguishing between different shapes and forms.",
            "Pattern Recognition: The ability to see and interpret patterns, which can be crucial in design and artistic fields.",
            "Visual Discrimination: The capacity to observe differences and similarities in visual stimuli."
        ],
        importanceInCareer: [
            "Form perception is important in artistic fields. Professionals in these areas often need to create, analyse, or modify shapes and forms, making strong form perception skills critical."
        ]
    },
    "Clerical Perception": {
        title: "Clerical Perception",
        description: [
            "Clerical perception refers to the ability to quickly and accurately identify details, patterns, and discrepancies in written data. It involves meticulous attention to detail and the ability to process information efficiently."
        ],
        keyComponents: [
            "Data Entry: The skill to accurately input information into databases or systems.",
            "Error Detection: The ability to spot errors or inconsistencies in documents or data sets.",
            "Organizational Skills: The capacity to categorize and manage information systematically."
        ],
        importanceInCareer: [
            "Clerical perception is essential in administrative roles, data entry positions, and any job requiring attention to detail. Strong clerical skills enhance productivity and accuracy in tasks involving documentation, record-keeping, and information management."
        ]
    }
};

export interface PersonalityResultSummary {
    personalityTypes: string;
    aptitudeType: string;
    interestAreas: string;
    stream: string;
    potentialCareerFields: string;
}

export interface AptitudeResult {
    title: string;
    description: string[];
    keyComponents: string[];
    importanceInCareer: string[];
    score: number;
}

export interface PersonalityResult {
    title: string;
    description: string[];
    keyComponents: string[];
    importanceInCareer: string[];
    score: number;
}

export interface DetailedResults {
    aptitudeResults: AptitudeResult[];
    personalityResults: PersonalityResult[];
    summary: PersonalityResultSummary;
}export interface PersonalityResultSummary {
    personalityTypes: string;
    aptitudeType: string;
    interestAreas: string;
    stream: string;
    potentialCareerFields: string;
}

export interface AptitudeResult {
    title: string;
    description: string[];
    keyComponents: string[];
    importanceInCareer: string[];
    score: number;
}

export interface PersonalityResult {
    title: string;
    description: string[];
    keyComponents: string[];
    importanceInCareer: string[];
    score: number;
}

export interface DetailedResults {
    aptitudeResults: AptitudeResult[];
    personalityResults: PersonalityResult[];
    summary: PersonalityResultSummary;
}