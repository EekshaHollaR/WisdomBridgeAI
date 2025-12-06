import type { KnowledgeModule } from './knowledge';

export interface AssessmentQuestion {
    id: number;
    question_type: 'MCQ' | 'OPEN_ENDED' | 'SCENARIO';
    prompt: string;
    options: string[] | null;
    weight: number;
}

export interface Assessment {
    id: number;
    module: KnowledgeModule | number; // Could be ID or object depending on serializer depth
    title: string;
    description: string;
    instructions: string;
    max_score: number;
    questions?: AssessmentQuestion[];
    created_at: string;
}

export interface AssessmentAttempt {
    id: number;
    assessment: number; // ID
    learner: number; // ID
    started_at: string;
    completed_at: string | null;
    score: number | null;
    results_detail: Record<string, any>; // JSON
}
