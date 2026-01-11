import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    desiredDegree: 'Masters Program',
    intakeYear: 'Winter 2026',
    fieldOfInterest: '',
    currentEducation: '',
    cgpa: '',
    budget: '',
    preferredCountry: 'Germany',
    germanLevel: 'None',
    background: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: submitError } = await supabase
        .from('consultations')
        .insert([
          {
            user_id: user?.id || null,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            desired_degree: formData.desiredDegree,
            intake_year: formData.intakeYear,
            field_of_interest: formData.fieldOfInterest,
            current_education: formData.currentEducation,
            cgpa: formData.cgpa,
            budget: formData.budget,
            preferred_country: formData.preferredCountry,
            german_level: formData.germanLevel,
            background: formData.background,
            status: 'pending',
          },
        ]);

      if (submitError) {
        setError(submitError.message);
      } else {
        setSuccess('Thank you! Your consultation request has been submitted. We will contact you within 24 hours.');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          desiredDegree: 'Masters Program',
          intakeYear: 'Winter 2026',
          fieldOfInterest: '',
          currentEducation: '',
          cgpa: '',
          budget: '',
          preferredCountry: 'Germany',
          germanLevel: 'None',
          background: '',
        });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-10 py-12 md:py-24">
      <div className="mb-12 flex flex-wrap justify-between items-end gap-6">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black leading-tight tracking-tight mb-4">Let's Plan Your Future in Germany</h1>
          <p className="opacity-60 text-lg">Expert counseling for premium study abroad experiences. Reach out to our specialized team of educational consultants today.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl h-12 px-6 bg-charcoal/5 dark:bg-white/10 font-bold hover:bg-charcoal/10 transition-colors">
          <span className="material-symbols-outlined">location_on</span>
          View Offices
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column */}
        <div className="lg:col-span-5 space-y-8">
          <h3 className="text-xl font-bold">Get in Touch</h3>
          <div className="space-y-4">
            {[
              { icon: 'phone', title: 'Call Now', val: '+49 123 456789', color: 'primary' },
              { icon: 'chat_bubble', title: 'WhatsApp Support', val: 'Counselor available 24/7', color: 'green-500' },
              { icon: 'mail', title: 'Email Us', val: 'support@vhl-abroad.com', color: 'blue-500' }
            ].map((card, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 p-5 items-start hover:shadow-md transition-shadow">
                <div className={`p-3 rounded-lg bg-${card.color === 'primary' ? 'primary' : card.color}/10 text-${card.color === 'primary' ? 'primary' : card.color}`}>
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold">{card.title}</h4>
                  <p className="opacity-60 text-sm">{card.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden h-72 w-full relative group bg-gray-200 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&q=80&w=800" 
              className="w-full h-full object-cover" 
              alt="Berlin Brandenburg Gate" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 dark:bg-bg-dark/90 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pin_drop</span>
                <span className="text-sm font-bold">Main HQ: Berlin, Germany</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
            <h4 className="font-bold mb-2">Why Germany?</h4>
            <p className="text-sm opacity-60">Tuition-free public universities, world-class engineering, and high post-study work opportunities. We handle the bureaucracy, you focus on your dream.</p>
          </div>
        </div>

        {/* Right column form */}
        <div className="lg:col-span-7">
          <div className="glass rounded-2xl p-8 shadow-2xl relative">
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-2">Request Free Consultation</h2>
              <p className="opacity-60 text-sm">Fill out the form below and our expert counselors will get back to you within 24 hours.</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600 text-xl">error</span>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            <form name="consultation-request" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="form-name" value="consultation-request" />
              <p className="hidden">
                <label>Don't fill this out if you're human: <input name="bot-field" /></label>
              </p>
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Full Name *</label>
                    <input 
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Email Address *</label>
                    <input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Phone Number *</label>
                  <input 
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="+91 00000 00000"
                    required
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">Academic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Desired Degree *</label>
                    <select 
                      name="desiredDegree"
                      value={formData.desiredDegree}
                      onChange={(e) => setFormData({ ...formData, desiredDegree: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-primary focus:border-primary"
                      required
                    >
                      <option>Bachelors Program</option>
                      <option>Masters Program</option>
                      <option>MBA</option>
                      <option>PhD / Research</option>
                      <option>Nursing Program</option>
                      <option>Vocational Training (Ausbildung)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Preferred Intake *</label>
                    <select 
                      name="intakeYear"
                      value={formData.intakeYear}
                      onChange={(e) => setFormData({ ...formData, intakeYear: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-primary focus:border-primary"
                      required
                    >
                      <option>Winter 2026</option>
                      <option>Summer 2026</option>
                      <option>Winter 2027</option>
                      <option>Summer 2027</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Field of Interest *</label>
                    <select 
                      name="fieldOfInterest"
                      value={formData.fieldOfInterest}
                      onChange={(e) => setFormData({ ...formData, fieldOfInterest: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="">Select Field</option>
                      <option>Computer Science / IT</option>
                      <option>Mechanical Engineering</option>
                      <option>Electrical Engineering</option>
                      <option>Data Science / AI</option>
                      <option>Business Administration</option>
                      <option>Medicine / Healthcare</option>
                      <option>Architecture</option>
                      <option>Economics</option>
                      <option>Law</option>
                      <option>Nursing</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Current Education Level</label>
                    <select 
                      name="currentEducation"
                      value={formData.currentEducation}
                      onChange={(e) => setFormData({ ...formData, currentEducation: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select Level</option>
                      <option>High School (12th Grade)</option>
                      <option>Undergraduate (Bachelors)</option>
                      <option>Graduate (Masters)</option>
                      <option>Professional</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">CGPA / Percentage</label>
                    <input 
                      name="cgpa"
                      type="text"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g., 8.5 / 10 or 85%"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">German Language Level</label>
                    <select 
                      name="germanLevel"
                      value={formData.germanLevel}
                      onChange={(e) => setFormData({ ...formData, germanLevel: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-primary focus:border-primary"
                    >
                      <option>None</option>
                      <option>A1</option>
                      <option>A2</option>
                      <option>B1</option>
                      <option>B2</option>
                      <option>C1</option>
                      <option>C2</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Preferred Country</label>
                    <select 
                      name="preferredCountry"
                      value={formData.preferredCountry}
                      onChange={(e) => setFormData({ ...formData, preferredCountry: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-primary focus:border-primary"
                    >
                      <option>Germany</option>
                      <option>Austria</option>
                      <option>Switzerland</option>
                      <option>Netherlands</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Budget Range (per year)</label>
                    <select 
                      name="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select Budget</option>
                      <option>Under €10,000</option>
                      <option>€10,000 - €15,000</option>
                      <option>€15,000 - €20,000</option>
                      <option>€20,000 - €30,000</option>
                      <option>Above €30,000</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tell us more about your goals</label>
                  <textarea 
                    name="background"
                    value={formData.background}
                    onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="Share your academic background, career goals, and any specific questions..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <p className="text-xs opacity-80">Your data is secured and will only be used to contact you regarding your educational inquiry.</p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl h-14 bg-primary text-white font-bold text-lg shadow-lg hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>Submit Request</span>
                    <span className="material-symbols-outlined">send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
