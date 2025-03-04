export interface Question {
    id: number,
    questionText: string,
    optionA: string,
    optionB: string,
    optionC: string,
    optionD: string,
    answer: string,
    note: string,
    score: string,
    image: string,
    questionCategoryId: number,
    typeOfQuestion:number
    questionType: number,
    questionTypeName: string, 
    questionCategoryName: string
}

export interface SortCriteria {
    field: string;
    order: number;
}

export interface Filter {
    field: string;
    matchMode: string;
    value: string;
    displayText: string;
}

export interface QuestionSearchModel {
    viewName: string;
    columnNames: string[];
    hiddenColumnNames: string[];
    sortCriteria: SortCriteria[];
    filters: Filter[];
    filterWith: number;
    convertFilterORtoUnion: boolean;
    includeDeleted: boolean;
    startIndex: number;
    pageSize: number;
    searchQuestionText: string;
    searchByOptionText: string;
    searchByAnswer: string;
    searchByNote: string;
    searchByScore: number;
    pageOffset: number;
    sort: string;
    order: string;
}

export interface QuestionRequestModel {
    questionSearchModel: QuestionSearchModel;
    examId: number;
    sectionId: number;
}

export interface questionSubmitModel {
    Id: number;
    UserId: number;
    PackageId: number;
    UserPackageId: number;
    ExamId: number;
    SectionId: number;
    IsCompleted: boolean;
    Score: number;
    StartedAtUtc: Date;
    CompletedAtUtc: Date;
    Status: number //1 =  pending, 2 = started, 3 = Inexam, 4 = :string;
}

export interface QuestionCategory {
    id: number;
    categoryName: string;
    description: string;
}