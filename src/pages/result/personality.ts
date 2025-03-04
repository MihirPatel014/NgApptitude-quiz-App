export interface Personality {
    title: string;
    description: string[];
    keyCharacteristics: string[];
    areasForImprovement: string[];
    guidingValues: string[];
}

// Personality Data Object
export const personalityDataList: Record<string, Personality> = {
    realistic: {
        title: "Realistic Personality",
        description: [
            "Realistic individuals are hands-on learners who thrive in the physical world. You are someone who is action-oriented, you appreciate tasks that lead to tangible results. You excel in practical environments where you can work with tools, machinery, and the outdoors, preferring physical activities over theoretical discussions.",
            "Your approach to exploration involves using your hands and eyes to accomplish things, whether it’s through outdoor work, mechanical tasks, or physical challenges. You prefer solving concrete problems rather than abstract ones, and you find that you best tackle challenges by taking direct, physical action.",
            "In summary, you are enjoying the satisfaction of hands-on work rather than engaging with ideas, data, or people. This practical approach defines how you interact with and make sense of the world around you."
        ],
        keyCharacteristics: [
            "Practical: Focuses on what is achievable and tangible, not overly idealistic.",
            "Independent: Prefers to work alone and make decisions based on facts.",
            "Physical Ability: Comfortable with physical labour and outdoor activities.",
            "Stable and Persistent: Reliable and dedicated to completing tasks.",
            "Honest and Direct: Values straightforward communication.",
        ],
        areasForImprovement: [
            "Abstract Thinking: May struggle with theoretical or abstract concepts that require critical thinking.",
            "Social Interaction: Often prefer to work alone and may find group work challenging or unappealing.",
            "Communication Skills: May not excel in verbal or written communication, potentially hindering collaboration in some workplaces.",
        ],
        guidingValues: ["Tradition", "Practicality", "Common sense", "Reliability", "Stability", "Efficiency"],
    },
    investigative: {
        title: "Investigative Personality",
        description: [
            "You have an investigative personality, which means you’re naturally analytical and curious. You thrive on studying and solving complex problems, often using scientific or analytical methods. You prefer to work independently and value accuracy and detail in everything you do.",
            "Instead of engaging in hands-on tasks, you enjoy reading, studying, and using data to inform your decisions. Your thinking is unconventional and independent; you have a knack for analysing situations and collecting information before making choices.",
            "When it comes to interactions with others, you tend to focus on ideas rather than physical actions. Even if you enjoy spending time outdoors, it’s more about your curiosity and desire to learn than it is about rugged, physical activities. You find satisfaction in using logic to tackle abstract problems, and your intellectual pursuits are what truly engage you.",
            "In essence, you live in your mind, exploring the world from a distance and enjoying the complexity of ideas and concepts."
        ],
        keyCharacteristics: [
            "Analytical thinking: Excel at breaking down problems into smaller parts to understand them thoroughly.",
            "Detail-oriented: Pay close attention to small details and facts.",
            "Intellectual curiosity: Have a strong desire to learn and explore new concepts.",
            "Independent worker: Prefer to work alone and take initiative on projects.",
            "Logical reasoning: Make decisions based on facts and data rather than emotions.",
            "Reserved nature: May be more introverted and prefer to observe before engaging."
        ],
        areasForImprovement: [
            "Social Interaction: May feel uncomfortable in social situations or collaborative environments, preferring solitary work.",
            "Risk Aversion: Can be hesitant to take risks, which may limit their willingness to explore new ideas or approaches.",
            "Perfectionism: Attention to detail can sometimes lead to over-analysis or difficulty in making decisions."
        ],
        guidingValues: ["Independence", "Curiosity", "Learning", "Analysis", "Insight", "Logic", "Exploration"]
    },
    artistic: {
        title: "Artistic Personality",
        description: [
            "You are someone who prioritizes creativity and self-expression. You thrive in environments that foster innovation and allow you to express yourself personally. Unstructured tasks that encourage imagination and originality are where you feel most at home.",
            "Your artistic nature means you value creativity deeply. You enjoy using both your hands and mind to create new things, appreciating beauty, variety, and the unexpected. You're drawn to interesting and unusual people, sights, textures, and sounds, which inspire your creativity. You're particularly sensitive to color, form, sound, and feeling, which enhances your creative endeavours.",
            "When faced with challenges, you solve problems through creativity, coming up with new ideas and solutions. Although not everyone may appreciate your unique perspective, you don't let opposition discourage you for long.",
            "Your artistic personality is a gift, allowing you to see the world through a lens that values imagination and originality."
        ],
        keyCharacteristics: [
            "Creative: Enjoy activities that involve creativity, originality, and independence.",
            "Emotional Intelligence: Often have a strong awareness of emotions, both their own and those of others, which enhances their creative work.",
            "Intuitive: Sensitive and emotional, and may prefer small groups over large groups.",
            "Imaginative: Able to come up with unique and original ideas.",
            "Flexibility: Adaptable and open to change, can easily shift their focus when necessary."
        ],
        areasForImprovement: [
            "Structure Preference: May struggle in highly structured environments that limit their creativity.",
            "Practicality: Sometimes overlook practical considerations in favor of artistic vision, which can lead to challenges in execution.",
            "Financial Stability: Artistic careers can sometimes lack financial security, leading to stress or instability."
        ],
        guidingValues: ["Creativity", "Expression", "Innovation", "Originality", "Independence", "Imagination", "Originality"]
    },
    social: {
        title: "Social Personality",
        description: [
            "Social individuals are naturally drawn to helping others and thrive in collaborative environments. You likely find fulfilment in supporting and nurturing relationships, and your motivation comes from a genuine desire to make a positive impact on the lives of those around you.",
            "You excel in situations that require interpersonal skills and collaboration. Valuing relationships is at the core of who you are, and you often seek ways to contribute meaningfully to others’ lives. As a social personality, you tend to be a dedicated leader - humanistic, responsible, and supportive.",
            "Instead of relying on physical activity to get things done, you use feelings, words, and ideas to connect with people. You enjoy closeness and sharing experiences, often finding joy in group activities and unstructured settings. Your friendly nature and strong communication skills allow you to solve problems through empathy and understanding.",
            "Your sensitivity to emotional cues enables you to address people's needs, sometimes before they even recognize them themselves. You have a unique ability to pull people together and generate positive energy for good causes.",
            "Overall, your social personality is a strength that can create meaningful connections and foster a supportive environment for everyone around you."
        ],
        keyCharacteristics: [
            "Enjoy interacting with others: Actively seek out social interactions and find pleasure in talking and connecting with people.",
            "Helpful and supportive: Want to assist others and contribute to their well-being.",
            "Good communicators: Excel at verbal and non-verbal communication, allowing you to understand and respond to others effectively.",
            "Empathy: Strong ability to understand and share the feelings of others, making them effective in supportive roles.",
            "Team players: Prefer working in collaborative environments where they can contribute to a group goal.",
            "Conflict Resolution: Skilled at mediating disputes and helping others find common ground."
        ],
        areasForImprovement: [
            "Emotional Strain: May take on the emotional burdens of others, leading to stress or burnout.",
            "Decision-Making: Can struggle with making decisions, especially if they feel it may upset others.",
            "Boundaries: Sometimes have difficulty setting boundaries, which can lead to overcommitment or personal neglect."
        ],
        guidingValues: ["Empathy", "Support", "Kindness", "Service to others", "Cooperation", "Communication", "Collaboration"]
    },
    enterprising: {
        title: "Enterprising Personality",
        description: [
            "You are an enterprising individual, driven by ambition and leadership. You thrive on influencing others and often excel in competitive environments. Your ambition pushes you to take on leadership roles, and you’re naturally drawn to opportunities where you can make an impact and drive results.",
            "As an enterprising person, you enjoy working with others to influence, persuade, and manage towards organizational goals or economic gain. Your leadership qualities shine through in your ability to organize and motivate people effectively. You appreciate the aspects of money, power, and status that come with being in charge.",
            "When it comes to problem-solving, you tend to take risks rather than relying solely on research. You trust your intuition about what will work best. While some may see you as restless or even irresponsible—especially if you move on from projects once they’re underway—your energy and drive are often what spark new ventures. Many initiatives wouldn’t even get off the ground without the enthusiasm and influence of someone like you.",
            "Your unique approach is a vital force in any team or organization, helping to propel ideas into action."
        ],
        keyCharacteristics: [
            "Leadership Abilities: Natural leaders who can motivate and inspire others to achieve goals.",
            "Extroverted: Comfortable interacting with people and enjoy social situations.",
            "Optimistic: Tend to have a positive outlook and believe in their abilities.",
            "Risk-taking: Comfortable taking calculated risks to pursue opportunities.",
            "Risk-Taking: Willing to take calculated risks to achieve success, which can lead to innovative solutions and opportunities.",
            "Goal-Oriented: Highly motivated to set and achieve goals, often with a strong focus on results."
        ],
        areasForImprovement: [
            "Impulsiveness: May act on impulse without fully considering the consequences, leading to potential setbacks.",
            "Conflict: Can be confrontational, especially if their ideas or leadership are challenged.",
            "Work-Life Balance: Their drive for success can lead to neglecting personal life and relationships."
        ],
        guidingValues: ["Risk taking", "Competition", "Influence", "Leadership", "Ambition", "Persuasion", "Initiative"]
    },
    conventional: {
        title: "Conventional Personality",
        description: [
            "Conventional individuals thrive in structured environments. You likely enjoy working with data, details, and established procedures. This preference for organization allows you to focus effectively on tasks and processes.",
            "As someone with a conventional personality, you are detail-oriented and value efficiency and accuracy in your work. You probably find satisfaction in tasks that involve data and numbers, and you prefer to follow clear instructions given by others. You tend to be quiet, careful, responsible, well-organized, and task-oriented. In your approach to problem-solving, you often rely on rules and established procedures to guide your decisions.",
            "Rather than seeking leadership roles, you enjoy carrying out tasks that have been initiated by others. Your attention to detail is crucial, as it helps maintain records and ensures that messages are transmitted accurately.",
            "Overall, your strengths lie in your ability to keep things organized and to work diligently towards achieving goals through structured methods."
        ],
        keyCharacteristics: [
            "Organization: Highly organized and detail-oriented, making them excellent at managing tasks and projects.",
            "Dependability: Reliable and trustworthy, often following through on commitments and deadlines.",
            "Orderly and systematic: Value clear structure and routine, preferring to work with well-defined tasks and established procedures.",
            "Practical and efficient: Prioritize getting tasks done effectively and with minimal fuss.",
            "Attention to Detail: Strong focus on accuracy and precision, which is essential in fields like accounting and administration.",
            "Methodical Approach: Enjoy working with established procedures and processes, leading to efficient workflows."
        ],
        areasForImprovement: [
            "Resistance to Change: May resist new ideas or changes in routine, which can hinder adaptability.",
            "Creativity Limitations: Often prefer structured tasks over creative endeavours, which may limit exploration of new ideas.",
            "Interpersonal Skills: May struggle in social situations, especially if they require spontaneity or emotional expression."
        ],
        guidingValues: ["Accuracy", "Stability", "Efficiency", "Organization", "Structure", "Detail", "Dependability"]
    }
};
