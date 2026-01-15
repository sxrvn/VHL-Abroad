import React, { useState } from 'react';
import { Card } from '../ui';

interface AddonFeature {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  description: string;
  includes: string[];
  status: string;
  pricing: string;
  note?: string;
  disclaimer?: string;
  gradient: string;
  category: 'communication' | 'analytics' | 'integration' | 'mobile' | 'premium';
}

const AddonsManagement: React.FC = () => {
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const addons: AddonFeature[] = [
    {
      id: 'chat',
      title: 'Student–Admin Chat System',
      icon: 'chat',
      iconColor: 'text-blue-500',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      description: 'Enable direct messaging between students and admins for doubt resolution and communication.',
      includes: [
        'Real-time chat interface',
        'Message history',
        'Read/unread indicators'
      ],
      status: 'Optional Add-on',
      pricing: 'Quoted separately',
      note: 'Ongoing moderation, customization, or UI changes are not included in maintenance.',
      category: 'communication'
    },
    {
      id: 'video-conferencing',
      title: 'Built-in Video Conferencing',
      icon: 'videocam',
      iconColor: 'text-red-500',
      gradient: 'from-red-500/10 to-pink-500/10',
      description: 'Conduct live classes directly inside the platform using an integrated video system (Jitsi / Custom).',
      includes: [
        'Built-in meeting rooms',
        'Audio/video controls',
        'Screen sharing'
      ],
      status: 'Advanced Add-on',
      pricing: 'Quoted separately',
      disclaimer: 'External platforms (Zoom / Google Meet) are recommended for reliability. Built-in conferencing requires additional setup, monitoring, and infrastructure.',
      category: 'premium'
    },
    {
      id: 'attendance',
      title: 'Attendance Tracking System',
      icon: 'how_to_reg',
      iconColor: 'text-green-500',
      gradient: 'from-green-500/10 to-emerald-500/10',
      description: 'Automatically track student attendance during live classes.',
      includes: [
        'Join/leave time tracking',
        'Duration calculation',
        'Attendance status reports'
      ],
      status: 'Optional Add-on',
      pricing: 'Quoted separately',
      note: 'Attendance data is informational only and subject to technical limitations.',
      category: 'analytics'
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics & Reports',
      icon: 'analytics',
      iconColor: 'text-purple-500',
      gradient: 'from-purple-500/10 to-violet-500/10',
      description: 'Gain deeper insights into student engagement and performance.',
      includes: [
        'Video watch-time analytics',
        'Engagement reports',
        'Exam performance trends',
        'Batch-wise analytics'
      ],
      status: 'Optional Add-on',
      pricing: 'Quoted separately',
      category: 'analytics'
    },
    {
      id: 'sms-whatsapp',
      title: 'SMS / WhatsApp Notifications',
      icon: 'sms',
      iconColor: 'text-teal-500',
      gradient: 'from-teal-500/10 to-cyan-500/10',
      description: 'Send automated alerts and reminders to students.',
      includes: [
        'Exam reminders',
        'Class notifications',
        'Important announcements'
      ],
      status: 'Optional Add-on',
      pricing: 'Quoted separately',
      note: 'Third-party SMS/WhatsApp charges apply separately.',
      category: 'communication'
    },
    {
      id: 'mobile-app',
      title: 'Mobile Application (Android / iOS)',
      icon: 'phone_android',
      iconColor: 'text-indigo-500',
      gradient: 'from-indigo-500/10 to-blue-500/10',
      description: 'Native mobile applications for students and admins.',
      includes: [
        'Android and/or iOS apps',
        'App store deployment'
      ],
      status: 'Premium Add-on',
      pricing: 'Quoted separately',
      category: 'mobile'
    },
    {
      id: 'payment-system',
      title: 'Payment Gateway Integration',
      icon: 'payment',
      iconColor: 'text-emerald-500',
      gradient: 'from-emerald-500/10 to-green-500/10',
      description: 'Integrated payment system within student dashboard for course fees, add-ons, and services.',
      includes: [
        'Secure payment processing',
        'Multiple payment methods support',
        'Payment history and receipts',
        'Refund management',
        'Payment reminders'
      ],
      status: 'Optional Add-on',
      pricing: 'Quoted separately',
      note: 'Payment gateway charges and transaction fees apply separately.',
      category: 'integration'
    },
    {
      id: 'certificates',
      title: 'Automated Certificate Generation',
      icon: 'workspace_premium',
      iconColor: 'text-amber-500',
      gradient: 'from-amber-500/10 to-yellow-500/10',
      description: 'Automatically generate and issue completion certificates to students upon course completion.',
      includes: [
        'Customizable certificate templates',
        'Automatic generation on course completion',
        'Digital signature integration',
        'PDF download and email delivery',
        'Certificate verification system'
      ],
      status: 'Optional Add-on',
      pricing: 'Quoted separately',
      note: 'Certificate criteria and completion rules can be configured based on exam scores, attendance, or manual approval.',
      category: 'premium'
    },
    {
      id: 'batch-calendar',
      title: 'Batch-wise Calendar System',
      icon: 'calendar_month',
      iconColor: 'text-cyan-500',
      gradient: 'from-cyan-500/10 to-blue-500/10',
      description: 'Interactive calendar system showing batch-specific schedules, classes, exams, and events.',
      includes: [
        'Batch-specific event calendars',
        'Class scheduling and reminders',
        'Exam date management',
        'Event notifications',
        'Calendar sync with Google/Outlook',
        'Student and admin calendar views'
      ],
      status: 'Optional Add-on',
      pricing: 'Quoted separately',
      note: 'Helps students track their batch schedules and upcoming events in an organized manner.',
      category: 'analytics'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Add-ons', icon: 'apps' },
    { id: 'communication', label: 'Communication', icon: 'forum' },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
    { id: 'integration', label: 'Integration', icon: 'integration_instructions' },
    { id: 'mobile', label: 'Mobile', icon: 'phone_android' },
    { id: 'premium', label: 'Premium', icon: 'workspace_premium' }
  ];

  const filteredAddons = activeFilter === 'all' 
    ? addons 
    : addons.filter(addon => addon.category === activeFilter);

  const maintenanceScope = {
    included: [
      'Bug fixes in existing core features',
      'Security updates',
      'Dependency upgrades',
      'Minor text/content changes'
    ],
    notIncluded: [
      'New feature development',
      'Feature customization',
      'UI redesigns',
      'Add-on feature support'
    ]
  };

  const enablementSteps = [
    { step: '1', title: 'Review', description: 'Review the add-on description', icon: 'search' },
    { step: '2', title: 'Contact', description: 'Contact the developer for pricing & feasibility', icon: 'contact_support' },
    { step: '3', title: 'Approve', description: 'Approve quotation', icon: 'approval' },
    { step: '4', title: 'Implement', description: 'Add-on implementation begins', icon: 'rocket_launch' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section with Overview */}
      <Card className="bg-gradient-to-br from-primary/5 via-orange-500/5 to-transparent p-6 sm:p-8 border-primary/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="material-symbols-outlined text-4xl sm:text-5xl text-white">extension</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Add-ons & Optional Features</h2>
            <p className="text-sm sm:text-base opacity-70 leading-relaxed">
              This platform is delivered with a core feature set designed for smooth and reliable daily operations. 
              Additional features listed below are optional upgrades and can be enabled anytime based on your future needs.
            </p>
          </div>
        </div>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveFilter(category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${activeFilter === category.id 
                ? 'bg-primary text-white shadow-md shadow-primary/30' 
                : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }
            `}
          >
            <span className="material-symbols-outlined text-lg">{category.icon}</span>
            <span className="text-sm">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAddons.map((addon) => (
          <Card
            key={addon.id}
            className={`
              group relative overflow-hidden transition-all duration-300 cursor-pointer
              hover:shadow-xl hover:scale-[1.02] hover:border-primary/30
              ${selectedAddon === addon.id ? 'ring-2 ring-primary shadow-xl scale-[1.02]' : ''}
            `}
            onClick={() => setSelectedAddon(selectedAddon === addon.id ? null : addon.id)}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${addon.gradient} opacity-50`} />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Icon and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className={`size-12 rounded-xl bg-gradient-to-br ${addon.gradient} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-2xl ${addon.iconColor}`}>
                    {addon.icon}
                  </span>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${addon.status === 'Premium Add-on' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                    : addon.status === 'Advanced Add-on'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-blue-500 text-white'
                  }
                `}>
                  {addon.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {addon.title}
              </h3>

              {/* Description */}
              <p className="text-sm opacity-70 mb-4 line-clamp-2">
                {addon.description}
              </p>

              {/* Expand/Collapse Indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary">
                  {addon.pricing}
                </span>
                <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100 transition-opacity">
                  {selectedAddon === addon.id ? 'expand_less' : 'expand_more'}
                </span>
              </div>

              {/* Expanded Details */}
              {selectedAddon === addon.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {/* Includes */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-green-500">check_circle</span>
                      Includes:
                    </h4>
                    <ul className="space-y-1.5">
                      {addon.includes.map((item, index) => (
                        <li key={index} className="text-sm opacity-70 flex items-start gap-2">
                          <span className="material-symbols-outlined text-xs mt-0.5 text-green-500">arrow_right</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Note */}
                  {addon.note && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-base mt-0.5">info</span>
                        <p className="text-xs opacity-80">{addon.note}</p>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {addon.disclaimer && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-base mt-0.5">warning</span>
                        <p className="text-xs opacity-80">{addon.disclaimer}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Button */}
                  <button className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">contact_support</span>
                    Request Quotation
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* How to Enable Section */}
      <Card className="p-6 sm:p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">help_center</span>
          How to Enable an Add-on
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {enablementSteps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < enablementSteps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -z-10" />
              )}
              
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="size-16 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center relative">
                  <span className="absolute -top-1 -right-1 size-6 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                  <span className="material-symbols-outlined text-2xl text-primary">{step.icon}</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-xs opacity-70">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Maintenance Clarification */}
      <Card className="border-2 border-red-500/20 bg-red-500/5 p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="size-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-red-500">lock</span>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">
              Maintenance Clarification (Very Important)
            </h3>
            <p className="text-sm opacity-80">
              All add-ons require separate approval and quotation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Included in Maintenance */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Annual Maintenance Covers:
            </h4>
            <ul className="space-y-2">
              {maintenanceScope.included.map((item, index) => (
                <li key={index} className="text-sm opacity-70 flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5 text-green-500">done</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not Included in Maintenance */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-base">cancel</span>
              Does NOT Include:
            </h4>
            <ul className="space-y-2">
              {maintenanceScope.notIncluded.map((item, index) => (
                <li key={index} className="text-sm opacity-70 flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5 text-red-500">close</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Final Note */}
      <Card className="bg-gradient-to-r from-primary/10 to-orange-500/10 border-primary/30 p-6">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-3xl text-primary">lightbulb</span>
          <div>
            <h4 className="font-semibold mb-2">Important Note</h4>
            <p className="text-sm opacity-80">
              Add-ons are designed to be modular and can be enabled anytime in the future without affecting 
              the stability of the core system. Each add-on is carefully architected to integrate seamlessly 
              with your existing setup.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddonsManagement;
