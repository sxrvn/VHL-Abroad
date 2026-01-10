
import React, { useState } from 'react';
import { GermanLevel } from '../types';

const Language: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<GermanLevel>(GermanLevel.A1);

  const levelInfo = {
    [GermanLevel.A1]: {
      title: 'Level A1: The Foundation',
      desc: 'Start from scratch. This level covers everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type. Learn to introduce yourself and others.',
      duration: '8-10 Weeks (Intensive)',
      syllabus: 'Grammar basics, counting, daily routines.',
      exam: 'Goethe-Zertifikat A1: Start Deutsch 1',
      vocab: '800 - 1,000 Words'
    },
    [GermanLevel.A2]: {
      title: 'Level A2: Elementary',
      desc: 'Understand and use sentences and frequently used expressions related to areas of most immediate relevance (e.g. basic personal information, shopping, geography, employment).',
      duration: '8-10 Weeks (Intensive)',
      syllabus: 'Tense systems, personal preferences, social events.',
      exam: 'Goethe-Zertifikat A2',
      vocab: '1,500 - 2,000 Words'
    },
    [GermanLevel.B1]: {
      title: 'Level B1: Intermediate',
      desc: 'Can understand the main points of clear standard input on familiar matters. Can deal with most situations likely to arise while traveling in an area where the language is spoken.',
      duration: '10-12 Weeks',
      syllabus: 'Complex clauses, expressing opinions, work topics.',
      exam: 'Goethe-Zertifikat B1',
      vocab: '2,500 - 3,000 Words'
    },
    [GermanLevel.B2]: {
      title: 'Level B2: Upper Intermediate',
      desc: 'Can understand the main ideas of complex text on both concrete and abstract topics. Can interact with a degree of fluency and spontaneity.',
      duration: '12-14 Weeks',
      syllabus: 'Abstract reasoning, technical discussions, formal writing.',
      exam: 'Goethe-Zertifikat B2 / TestDaF',
      vocab: '4,000+ Words'
    }
  };

  const currentLevel = levelInfo[activeLevel];

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-20 py-12 md:py-24">
      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-12 items-center mb-24">
        <div className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">verified</span>
            98% Success Rate in Goethe Exams
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Master German for Your <span className="text-primary">Global Future</span>
            </h1>
            <p className="text-lg opacity-70 max-w-[540px]">
              Premium A1 to B2 language training tailored for students and professionals looking to excel in Germany. Expert-led curriculum designed for rapid fluency.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="h-12 px-8 rounded-xl bg-primary text-white font-bold hover:shadow-xl hover:shadow-primary/30 transition-all">
              View Course Details
            </button>
            <button className="h-12 px-8 rounded-xl bg-white dark:bg-white/10 border border-charcoal/10 dark:border-white/20 font-bold hover:bg-gray-100 dark:hover:bg-white/20 transition-all">
              Free Assessment
            </button>
          </div>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="size-10 rounded-full border-2 border-white dark:border-bg-dark bg-gray-500 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i*10}/40/40`} alt="student" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium"><span className="font-bold">2,500+</span> Students Certified</p>
          </div>
        </div>
        <div className="relative">
          <div className="w-full aspect-square rounded-3xl bg-gray-200 overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=800" alt="Classroom" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white dark:bg-bg-dark p-6 rounded-2xl shadow-xl border border-charcoal/5 hidden md:block">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-50">Next Batch Starts</p>
                <p className="font-bold text-lg">Monday, Feb 15th</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Explore Our German Proficiency Levels</h2>
          <p className="opacity-60">Choose the right level to begin your journey to German fluency.</p>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-3xl p-4 lg:p-10 shadow-sm border border-charcoal/5">
          <div className="flex flex-wrap border-b border-charcoal/10 dark:border-white/10 mb-10 overflow-x-auto whitespace-nowrap">
            {(Object.keys(GermanLevel) as Array<keyof typeof GermanLevel>).map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(GermanLevel[level])}
                className={`flex-1 flex flex-col items-center justify-center border-b-[3px] pb-4 pt-2 transition-all ${activeLevel === level ? 'border-primary text-primary' : 'border-transparent text-neutral-400 hover:text-primary'}`}
              >
                <p className="text-sm font-bold tracking-wide">{level} - {level === 'A1' ? 'BEGINNER' : level === 'A2' ? 'ELEMENTARY' : level === 'B1' ? 'INTERMEDIATE' : 'UPPER INT.'}</p>
              </button>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">{currentLevel.title}</h3>
                <p className="opacity-70 leading-relaxed">{currentLevel.desc}</p>
              </div>
              <div className="space-y-1">
                {[
                  { label: 'Course Duration', val: currentLevel.duration, pill: true },
                  { label: 'Syllabus Highlights', val: currentLevel.syllabus },
                  { label: 'Exam Target', val: currentLevel.exam },
                  { label: 'Vocabulary Goal', val: currentLevel.vocab }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-4 border-b border-charcoal/5">
                    <p className="opacity-50 text-sm font-medium uppercase tracking-wider">{item.label}</p>
                    <p className={`text-sm font-bold ${item.pill ? 'bg-primary/10 text-primary px-3 py-1 rounded-lg' : ''}`}>{item.val}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button className="flex-1 h-12 rounded-xl bg-primary text-white font-bold">Enroll in {activeLevel}</button>
                <button className="px-6 h-12 rounded-xl border border-charcoal/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined align-middle">download</span> Syllabus
                </button>
              </div>
            </div>
            <div className="bg-bg-light dark:bg-white/5 rounded-2xl p-8 border border-primary/10 flex flex-col justify-center">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">psychology</span>
                Our Methodology
              </h4>
              <div className="space-y-6">
                {[
                  { icon: 'record_voice_over', title: 'Active Communication', desc: 'Focus on speaking from Day 1. No boring rote memorization.' },
                  { icon: 'devices', title: 'Blended Learning', desc: 'Live sessions combined with 24/7 access to digital assets.' },
                  { icon: 'groups', title: 'Native Exposure', desc: 'Weekend sessions with native speakers for accent training.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="size-10 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold mb-1">{item.title}</p>
                      <p className="text-sm opacity-60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Language;
