import type { KnowledgeModule, Scenario } from './knowledge';

export interface MentorshipMessage {
    id: number;
    sender_type: 'ai' | 'learner' | 'expert';
    content: string;
    created_at: string;
}

export interface MentorshipSession {
    id: number;
    learner: number;
    expert: number | null;
    scenario: Scenario | null;
    module: KnowledgeModule | null;
    mode: 'LIVE' | 'ASYNC' | 'AI_AVATAR';
    status: 'ACTIVE' | 'COMPLETED';
    personalization_context: any;
    created_at: string;
    messages?: MentorshipMessage[];
}
