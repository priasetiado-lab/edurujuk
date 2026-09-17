/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import type { Feedback, ManualQuestion, Profile, Question, QuestionHistory } from './types';

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const supabaseAnonKey=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const supabase=(supabaseUrl&&supabaseAnonKey)?createClient(supabaseUrl,supabaseAnonKey):null;

const owner=import.meta.env.VITE_GITHUB_OWNER as string|undefined;
const repo=import.meta.env.VITE_GITHUB_REPO || 'data-edurujuk';
const branch=import.meta.env.VITE_GITHUB_BRANCH || 'main';
const path=import.meta.env.VITE_GITHUB_QUESTIONS_PATH || 'questions.json';
export const githubUrl=owner?`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${branch}/${path.split('/').map(encodeURIComponent).join('/')}`:'';
const CACHE_KEY='bawolato_questions_cache_v1';

// Diperbarui agar lebih fleksibel membaca tipe data dari JSON GitHub
function validQuestion(x:any): x is Question {
  return !!x && typeof x.id === 'string' && typeof x.question === 'string' && typeof x.answer === 'string';
}

export async function fetchQuestions():Promise<{questions:Question[];source:'github'|'cache'}>{
  if(!githubUrl) throw new Error('VITE_GITHUB_OWNER belum diatur.');
  try {
    const r=await fetch(githubUrl,{cache:'no-store'});
    if(!r.ok) throw new Error(`GitHub HTTP ${r.status}`);
    const raw=await r.json();
    if(!Array.isArray(raw)) throw new Error('Format questions.json harus berupa array.');
    
    // Normalisasi data agar aman dari perbedaan tipe data (string/number/boolean)
    const qs: Question[] = raw.filter(validQuestion).map((q, idx) => ({
      ...q,
      active: q.active === true || q.active === 'true',
      sort_order: Number.isFinite(Number(q.sort_order)) ? Number(q.sort_order) : idx
    })).sort((a,b)=>a.sort_order-b.sort_order);

    if(!qs.length) throw new Error('Tidak ada pertanyaan valid.');
    localStorage.setItem(CACHE_KEY,JSON.stringify(qs));
    localStorage.setItem(`${CACHE_KEY}_time`,new Date().toISOString());
    return {questions:qs,source:'github'};
  }
  catch(e){
    const cached=localStorage.getItem(CACHE_KEY);
    if(cached){
      const qs=JSON.parse(cached) as Question[];
      return {questions:qs,source:'cache'};
    }
    throw e;
  }
}

export function cachedQuestions():Question[]{try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'[]') as Question[]}catch{return[]}}
export function cacheTime(){return localStorage.getItem(`${CACHE_KEY}_time`)}

export async function insertHistory(data:Omit<QuestionHistory,'id'>){ if(!supabase) throw new Error('Supabase belum dikonfigurasi.'); const {error}=await supabase.from('question_history').insert(data); if(error) throw error; }
export async function insertManual(data:Omit<ManualQuestion,'id'>){ if(!supabase) throw new Error('Supabase belum dikonfigurasi.'); const {error}=await supabase.from('manual_questions').insert(data); if(error) throw error; }
export async function insertFeedback(data:Omit<Feedback,'id'>){ if(!supabase) throw new Error('Supabase belum dikonfigurasi.'); const {error}=await supabase.from('feedback').insert(data); if(error) throw error; }

export async function getAdminData(){
  if(!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const [h,m,f]=await Promise.all([
    supabase.from('question_history').select('*').order('created_at',{ascending:false}),
    supabase.from('manual_questions').select('*').order('created_at',{ascending:false}),
    supabase.from('feedback').select('*').order('created_at',{ascending:false})
  ]);
  for(const r of [h,m,f]) if(r.error) throw r.error;
  return {history:(h.data||[]) as QuestionHistory[],manualQuestions:(m.data||[]) as ManualQuestion[],feedbacks:(f.data||[]) as Feedback[]};
}
export async function getProfile(userId:string):Promise<Profile|null>{ if(!supabase) return null; const {data,error}=await supabase.from('profiles').select('*').eq('id',userId).maybeSingle(); if(error) throw error; return data as Profile|null; }
export async function answerManual(q:ManualQuestion,answer:string,userId:string){ if(!supabase) throw new Error('Supabase belum dikonfigurasi.'); const now=new Date().toISOString(); const {error}=await supabase.from('manual_questions').update({answer,status:'answered',answered_at:now,answered_by:userId}).eq('id',q.id); if(error) throw error; await insertHistory({client_name:q.client_name,question_id:null,question_text:q.question,answer_text:answer,question_type:'manual',created_at:now}); }
export async function markFeedbackRead(id:string){ if(!supabase) throw new Error('Supabase belum dikonfigurasi.'); const {error}=await supabase.from('feedback').update({status:'read',read_at:new Date().toISOString()}).eq('id',id); if(error) throw error; }
export async function signIn(email:string,password:string){ if(!supabase) throw new Error('Supabase belum dikonfigurasi.'); const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; return data.user; }
export async function signOut(){ if(supabase) await supabase.auth.signOut(); }