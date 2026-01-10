
import { NavItem, Testimonial, Service } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Language Training', path: '#/' },
  { label: 'Your Journey', path: '#/journey' },
  { label: 'Study in Germany', path: '#/universities' },
  { label: 'Visa Services', path: '#/services' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    role: 'MS in Data Science, TU Berlin',
    comment: 'VHL handled everything from my language classes to my apartment in Berlin. Their presence in Germany is a game-changer for new students.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    rating: 5
  },
  {
    id: 2,
    name: 'Ananya Patel',
    role: 'MBA, Munich Business School',
    comment: 'I was worried about the visa process, but the team at VHL prepared me so well. I got my visa in just 3 weeks without any stress.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    rating: 5
  },
  {
    id: 3,
    name: 'Vikram Singh',
    role: 'Mechanical Engineer, Stuttgart',
    comment: "They don't just send you to study; they help you build a career. I'm now working at a top automotive firm thanks to their guidance.",
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    rating: 5
  }
];

export const SERVICES: Service[] = [
  {
    id: 'aps',
    title: 'APS Guidance',
    description: 'Complete verification assistance for Academic Evaluation Center (APS) certification, mandatory for German visas.',
    icon: 'verified_user',
    badge: 'Fast-Track: 2-4 Weeks',
    highlights: ['Document authenticity check', 'Application filing assistance', 'Embassy coordination'],
    image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'blocked-account',
    title: 'Blocked Account',
    description: 'Secure your financial proof with authorized German providers like Expatrio, Fintiba, or Coracle.',
    icon: 'account_balance',
    badge: 'Partnered with Top Providers',
    highlights: ['Provider comparison guide', '0% commission fees', 'Instant confirmation support'],
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sop-cv',
    title: 'SOP & CV Prep',
    description: 'Tailored professional documentation that aligns with German university admissions and visa requirements.',
    icon: 'description',
    badge: 'Custom-written content',
    highlights: ['Expert storytelling', 'University-specific focus', 'Plagiarism-free guarantee'],
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800'
  }
];
