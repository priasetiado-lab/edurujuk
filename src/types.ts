export type QuestionType = 'auto' | 'manual';
export type ManualStatus = 'unanswered' | 'answered';
export type FeedbackStatus = 'unread' | 'read';

export interface Question { id:string; category?:string; question:string; answer:string; active:boolean; sort_order:number; }
export interface QuestionHistory { id:string; client_name:string; question_id:string|null; question_text:string; answer_text:string; question_type:QuestionType; created_at:string; }
export interface ManualQuestion { id:string; client_name:string; question:string; answer:string|null; status:ManualStatus; created_at:string; answered_at:string|null; answered_by:string|null; }
export interface Feedback { id:string; client_name:string; message:string; status:FeedbackStatus; created_at:string; read_at:string|null; }
export interface Profile { id:string; username:string|null; role:'admin'; created_at:string; }
