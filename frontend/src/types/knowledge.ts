export interface KnowledgeItem {
    id: number;
    title: string;
    description: string;
    type: string;
    tags: string[];
    importance_level: number;
}

export interface InterviewQuestion {
    id: number;
    question_text: string;
    order: number;
}

export interface InterviewAnswer {
    id: number;
    question: number | null; // question ID
    answer_text: string;
}

export interface KnowledgeInterviewSession {
    id: number;
    title: string;
    description: string;
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
    created_at: string;
    questions: InterviewQuestion[];
    answers: InterviewAnswer[];
    knowledge_items: KnowledgeItem[];
    raw_transcript?: string;
    structured_notes?: any;
}
