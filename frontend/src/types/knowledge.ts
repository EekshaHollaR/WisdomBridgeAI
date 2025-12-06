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

export interface Scenario {
    id: number;
    title: string;
    description: string;
    situation_prompt: string;
    recommended_approach: string;
    risks_to_consider: string;
    tags: string[];
}

export interface DecisionNode {
    id: number;
    prompt: string;
    next_if_yes: number | null;
    next_if_no: number | null;
    notes: string;
    is_terminal: boolean;
}

export interface KnowledgeModule {
    id: number;
    title: string;
    description: string;
    objectives: string[];
    difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    scenarios: Scenario[];
    decision_tree: DecisionNode[];
}

export interface LearningPath {
    id: number;
    name: string;
    description: string;
    target_role: string;
    modules: KnowledgeModule[];
}
