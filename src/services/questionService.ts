import { apiRequest } from "../common/requestwithdata";
import { Question, QuestionCategory, QuestionRequestModel, QuestionSearchModel, questionSubmitModel } from "../types/question";

// api/User/Register
const QUESTION_URL = 'api/Question';
const QUESTIONs_CATEGORY_URL = 'api/QuestionCategory';

const GET_QUESTION_BY_EXAM_AND_SECTION_ID = "/GetAllQuestionsByExamIdAndSectionId"
const GET_QUESTION_CATEGORYS_BY_ID = "/GetQuestionCategoryById"
const GET_ALL_QUESTION_CATEGORYS = '/GetAllQuestionCategorys'
const SUBMIT_EXAM_QUESTION = "/SubmitExam"

export const getQuestionbyExamAndSectionId = async (examId: number, sectionId: number) => {

  const questionSearchModel: QuestionSearchModel = {
    viewName: "",
    columnNames: [],
    hiddenColumnNames: [],
    sortCriteria: [
      {
        field: "",
        order: 0,
      },
    ],
    filters: [
      {
        field: "",
        matchMode: "",
        value: "",
        displayText: "",
      },
    ],
    filterWith: 0,
    convertFilterORtoUnion: false,
    includeDeleted: false,
    startIndex: 0,
    pageSize: 0,
    searchQuestionText: "",
    searchByOptionText: "",
    searchByAnswer: "",
    searchByNote: "",
    searchByScore: 0,
    pageOffset: 0,
    sort: "",
    order: "",
  };

  const requestWithData: QuestionRequestModel = {
    examId,
    sectionId,
    questionSearchModel: questionSearchModel,
  };

  const result = await apiRequest<QuestionRequestModel, Array<Question>>(
    `/${QUESTION_URL}${GET_QUESTION_BY_EXAM_AND_SECTION_ID}`,
    "POST",
    requestWithData
  );

  if (result.success) {
    return result.data; // Return the packages data
  } else {
    console.log("Error fetching packages:", result.errors);
    return null;
  }
};

export const submitExamQuestions = async (data: questionSubmitModel) => {
  const result = await apiRequest<questionSubmitModel, Array<questionSubmitModel>>(
    `/${QUESTION_URL}${SUBMIT_EXAM_QUESTION}`,
    "POST",
    data
  );
  if (result.success) {
    return result.data; // Return the packages data
  } else {
    console.log("Error Submit  questions:", result.errors);
    return null;
  }
}

export const GetquestionsCategoryById = async (id: number) => {
  const result = await apiRequest<typeof id, QuestionCategory>(
    `/${QUESTIONs_CATEGORY_URL}${GET_QUESTION_CATEGORYS_BY_ID}`,
    "POST",
    id
  );
  if (result.success) {
    return result.data; // Return the packages data
  } else {
    console.log("Error Submit  questions:", result.errors);
    return null;
  }
}

export const GetAllquestionsCategory = async () => {

  const questionSearchModel: QuestionSearchModel = {
    viewName: "",
    columnNames: [],
    hiddenColumnNames: [],
    sortCriteria: [
      {
        field: "",
        order: 0,
      },
    ],
    filters: [
      {
        field: "",
        matchMode: "",
        value: "",
        displayText: "",
      },
    ],
    filterWith: 0,
    convertFilterORtoUnion: false,
    includeDeleted: false,
    startIndex: 0,
    pageSize: 0,
    searchQuestionText: "",
    searchByOptionText: "",
    searchByAnswer: "",
    searchByNote: "",
    searchByScore: 0,
    pageOffset: 0,
    sort: "",
    order: "",
  };

  const result = await apiRequest<QuestionSearchModel, Array<QuestionCategory>>(
    `/${QUESTIONs_CATEGORY_URL}${GET_ALL_QUESTION_CATEGORYS}`,
    "POST",
    questionSearchModel
  );
  if (result.success) {
    return result.data; // Return the packages data
  } else {
    console.log("Error Submit  questions:", result.errors);
    return null;
  }
}