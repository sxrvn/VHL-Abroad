
import React from 'react';
import { Link } from 'react-router-dom';

const Universities: React.FC = () => {
  return (
    <div className="py-12 md:py-24 px-6 md:px-20 lg:px-40">
      <div className="max-w-[1200px] mx-auto space-y-24">
        {/* Comparison Hero */}
        <section className="text-center space-y-6">
          <span className="inline-block bg-primary/90 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Elite Choice</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Public vs Private Universities</h1>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg leading-relaxed">Understand the fundamental differences between the two main educational pillars in Germany.</p>
        </section>

        {/* Comparison Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Public */}
          <div className="glass p-10 rounded-3xl relative overflow-hidden group border border-charcoal/5">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl">account_balance</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black">Public Universities</h3>
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-black">€0</span>
              <span className="text-neutral-500 font-bold">tuition fees</span>
            </div>
            <ul className="space-y-4 mb-10">
              <li className="flex gap-3 items-center font-medium">
                <span className="material-symbols-outlined text-green-500">check_circle</span> State-funded excellence
              </li>
              <li className="flex gap-3 items-center font-medium">
                <span className="material-symbols-outlined text-green-500">check_circle</span> Strong research focus
              </li>
              <li className="flex gap-3 items-center font-medium">
                <span className="material-symbols-outlined text-green-500">check_circle</span> High academic reputation
              </li>
              <li className="flex gap-3 items-start font-medium text-neutral-400 italic">
                <span className="material-symbols-outlined text-amber-500 mt-1 text-sm">info</span> Primarily German-taught programs
              </li>
            </ul>
            <Link to="/login" className="w-full py-4 rounded-xl border-2 border-charcoal/10 dark:border-white/10 font-bold hover:bg-primary hover:border-primary hover:text-white transition-all flex items-center justify-center">Explore Public Options</Link>
          </div>

          {/* Private */}
          <div className="glass p-10 rounded-3xl relative overflow-hidden group border border-charcoal/5">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl">corporate_fare</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black">Private Universities</h3>
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">Industry Focused</span>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-black">€10k+</span>
              <span className="text-neutral-500 font-bold">per year avg.</span>
            </div>
            <ul className="space-y-4 mb-10">
              <li className="flex gap-3 items-center font-medium">
                <span className="material-symbols-outlined text-green-500">check_circle</span> English-taught programs
              </li>
              <li className="flex gap-3 items-center font-medium">
                <span className="material-symbols-outlined text-green-500">check_circle</span> Practical & career-oriented
              </li>
              <li className="flex gap-3 items-center font-medium">
                <span className="material-symbols-outlined text-green-500">check_circle</span> Smaller class sizes (15-25)
              </li>
              <li className="flex gap-3 items-center font-medium">
                <span className="material-symbols-outlined text-green-500">check_circle</span> Strong industry partnerships
              </li>
            </ul>
            <Link to="/login" className="w-full py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center">Explore Private Options</Link>
          </div>
        </section>

        {/* Financial Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight">Cost of Education & Living</h2>
            <p className="text-neutral-500 mb-8 leading-relaxed">While tuition at public universities is free, students need to budget for living expenses and social contributions.</p>
            <div className="space-y-6">
              {[
                { label: 'Rent & Utilities', range: '€450 - €600', fill: 'w-[45%]', icon: 'home' },
                { label: 'Health Insurance', range: '€110 - €120', fill: 'w-[15%]', icon: 'health_and_safety' },
                { label: 'Food & Leisure', range: '€250 - €350', fill: 'w-[30%]', icon: 'restaurant' }
              ].map((item, idx) => (
                <div key={idx} className="p-5 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-charcoal/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">{item.icon}</span> {item.label}</span>
                    <span className="font-black text-primary">{item.range}</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className={`bg-primary h-full ${item.fill}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-xl">
            <div className="mb-8 p-6 bg-primary/10 rounded-full">
              <span className="material-symbols-outlined text-primary text-6xl">account_balance_wallet</span>
            </div>
            <h3 className="text-2xl font-black mb-2">Blocked Account Requirement</h3>
            <p className="text-neutral-500 mb-6">Required for the German Student Visa (Finanzierungsnachweis)</p>
            <div className="text-5xl font-black text-primary mb-2">€11,208</div>
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Total per year (2026)</p>
            <div className="mt-8 pt-8 border-t border-charcoal/10 w-full text-left">
              <p className="text-sm italic text-neutral-500">Note: This amount is withdrawn monthly to cover your living costs during your stay.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Universities;
