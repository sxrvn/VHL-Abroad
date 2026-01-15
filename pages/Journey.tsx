
import React from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../constants';

const Journey: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative animated-bg bg-gradient-to-br from-bg-light to-primary/5 dark:from-bg-dark dark:to-primary/5">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-16 md:py-28 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Join 1000+ Students in Germany
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter">
              <span className="whitespace-nowrap">Your Gateway to</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Study & Settle</span> <br />
              in Germany
            </h1>
            <p className="text-lg text-charcoal/70 dark:text-white/70 max-w-lg leading-relaxed">
              Premium consultancy specializing in free education at German public universities and high-growth career placements.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all">Start Your Journey</Link>
              <button onClick={() => document.getElementById('journey-steps')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white dark:bg-white/10 text-charcoal dark:text-white font-bold rounded-xl border border-charcoal/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">play_circle</span>
                How it Works
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
            <div className="relative glass p-8 rounded-3xl shadow-2xl space-y-6">
              <div 
                className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-200" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&h=800&q=90&fm=webp")', backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/40">
                  <h4 className="text-2xl font-bold text-primary">0€</h4>
                  <p className="text-xs font-medium opacity-70">Tuition Fees</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/40">
                  <h4 className="text-2xl font-bold text-primary">18m</h4>
                  <p className="text-xs font-medium opacity-70">Job Search Visa</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-primary text-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase opacity-80">Next Intake</p>
                  <p className="text-lg font-bold">Winter 2026</p>
                </div>
                <span className="material-symbols-outlined text-4xl">calendar_month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Germany Section */}
      <section className="py-24 px-6 md:px-20 bg-white dark:bg-bg-dark/50">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm">Opportunities</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight">Why Study in Germany?</h3>
            <p className="opacity-70">Europe's economic engine offers more than just education; it offers a lifetime of security and growth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'account_balance', title: 'Zero Tuition Fees', text: 'Most public universities offer world-class degrees for free, regardless of your nationality.' },
              { icon: 'work_history', title: '18-Month Visa', text: 'Stay back for up to 18 months after graduation to find a job and start your professional life.' },
              { icon: 'trending_up', title: 'Economic Power', text: 'Access the strongest economy in Europe with thousands of vacancies in tech, engineering, and healthcare.' },
              { icon: 'public', title: 'Global Recognition', text: 'German degrees are globally respected, opening doors to top-tier multinational companies.' }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-bg-light dark:bg-white/5 border border-transparent hover:border-primary/20 hover:shadow-2xl transition-all group">
                <div className="size-14 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-sm opacity-70 leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 md:px-20 bg-primary text-white">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-6">
            <h3 className="text-4xl md:text-5xl font-black leading-tight">Expertise You Can Trust</h3>
            <p className="text-lg opacity-90 leading-relaxed">VHL Abroad Career is not just an agency; we are your mentors on the ground. With offices in both India and Germany, we ensure you never feel alone in your journey.</p>
            <div className="flex flex-wrap gap-8 pt-6">
              {[
                { label: 'Visa Success', value: '99.2%' },
                { label: 'Partner Unis', value: '50+' },
                { label: 'On-Ground Support', value: '24/7' }
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-4xl font-black">{stat.value}</span>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            <div 
              className="rounded-3xl overflow-hidden aspect-[4/5] bg-gray-300" 
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&h=300&q=90&fm=webp")', backgroundSize: 'cover' }}
            ></div>
            <div 
              className="rounded-3xl overflow-hidden aspect-[4/5] bg-gray-300 mt-12" 
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&h=300&q=90&fm=webp")', backgroundSize: 'cover' }}
            ></div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="journey-steps" className="py-24 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm">Step-by-Step</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight">Your Journey to Germany</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {[
              { title: 'Profile Review', text: 'Free assessment of your academic background.' },
              { title: 'Language', text: 'Intensive German language training (A1-C1).' },
              { title: 'Application', text: 'Direct university application and admission.' },
              { title: 'Visa Prep', text: 'Comprehensive visa documentation and interviews.' },
              { title: 'Landed!', text: 'On-ground pickup, housing & job assistance.', highlighted: true }
            ].map((step, idx) => (
              <div key={idx} className="text-center space-y-6 relative z-10">
                <div className={`size-16 rounded-full mx-auto flex items-center justify-center font-black text-xl shadow-lg ${step.highlighted ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-white/10 border-2 border-primary text-primary shadow-primary/10'}`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                  <p className="text-sm opacity-70">{step.text}</p>
                </div>
              </div>
            ))}
            <div className="hidden md:block absolute top-8 left-8 right-8 h-0.5 bg-gray-200 dark:bg-white/10 -z-0"></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-20 bg-bg-light dark:bg-bg-dark overflow-hidden">
        <div className="max-w-[1280px] mx-auto">
          <h3 className="text-3xl md:text-4xl font-black mb-12">Success Stories</h3>
          <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="min-w-[350px] md:min-w-[400px] bg-white dark:bg-white/5 p-8 rounded-3xl snap-center shadow-xl border border-charcoal/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">person</span>
                  </div>
                  <div>
                    <h5 className="font-bold">{t.name}</h5>
                    <p className="text-xs opacity-60">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm italic opacity-80 leading-relaxed mb-6">"{t.comment}"</p>
                <div className="flex text-primary gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm">star</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Journey;
