
import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../constants';

const Services: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20 py-12 md:py-24">
      {/* Services Hero */}
      <section className="flex flex-col gap-8 lg:flex-row items-center mb-24">
        <div className="w-full lg:w-1/2 aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg order-2 lg:order-1">
<img
  src="https://images.unsplash.com/photo-KNbKaygXUCE?auto=format&fit=crop&q=80&w=800"
  alt="Books on white textile representing education and learning"
  className="w-full h-full object-cover"
/>

        </div>
        <div className="flex flex-col gap-6 w-full lg:w-1/2 justify-center order-1 lg:order-2">
          <div className="flex flex-col gap-3">
            <span className="text-primary font-bold text-sm uppercase tracking-widest">Premium Consultancy</span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Expert Administrative Support for Your German Journey
            </h1>
            <p className="opacity-70 text-lg">
              Simplifying APS, Blocked Accounts, and Visa processes with high-end, personalized consultancy tailored for international students.
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="min-w-[180px] rounded-xl h-12 bg-primary text-white font-bold hover:shadow-lg transition-all flex items-center justify-center">Explore Services</Link>
            <button className="rounded-xl h-12 px-6 border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all">Case Studies</button>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <div className="bg-white dark:bg-bg-dark/50 rounded-xl p-8 mb-24 border border-charcoal/5 flex flex-wrap justify-around items-center gap-8 shadow-sm">
        {[
          { label: 'Visas Approved', val: '5000+' },
          { label: 'Success Rate', val: '99%' },
          { label: 'Premium Support', val: '24/7' }
        ].map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-3xl font-black text-primary">{stat.val}</span>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Service Grid */}
      <section className="space-y-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Our Premium Services</h2>
          <p className="opacity-60">Comprehensive end-to-end assistance for your academic success in Germany.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <div key={service.id} className="group relative overflow-hidden rounded-xl bg-white dark:bg-white/5 border border-charcoal/5 shadow-md hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary">{service.icon}</span>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                </div>
                <p className="opacity-70 text-sm mb-4">{service.description}</p>
                {service.badge && (
                  <div className="flex items-center gap-1 text-primary text-xs font-bold uppercase">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    {service.badge}
                  </div>
                )}
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-primary/95 text-white p-8 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h4 className="text-xl font-bold mb-4">What's Included?</h4>
                <ul className="text-sm mb-6 space-y-2 text-left">
                  {service.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">check_circle</span> {h}
                    </li>
                  ))}
                </ul>
                <button className="bg-white text-primary px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How We Assist */}
      <section className="py-24">
        <h3 className="text-center text-2xl font-bold mb-12">How We Assist You</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { n: '1', t: 'Initial Review', d: 'We assess your profile and document status.' },
            { n: '2', t: 'Admin Prep', d: 'APS filing, Blocked Account & Insurance setup.' },
            { n: '3', t: 'Visa Filing', d: 'Detailed checklist and VFS submission support.' },
            { n: '4', t: 'Post-Landing', d: 'Registration (Anmeldung) and bank activation.' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 bg-white dark:bg-white/5 rounded-xl border border-charcoal/5">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-4">{item.n}</div>
              <h4 className="font-bold mb-2">{item.t}</h4>
              <p className="text-xs opacity-60">{item.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Services;
