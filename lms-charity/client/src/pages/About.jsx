import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Linkedin, Heart, Users, BookOpen, Globe, Target, Lightbulb } from 'lucide-react';

// Simple JS Animated Counter that starts when in view
function AnimatedCounter({ to, duration = 3000, suffix = '', ...props }) {
  const [display, setDisplay] = React.useState(0);
  const ref = React.useRef();
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    let observer;
    if (ref.current) {
      observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(ref.current);
    }
    return () => observer && observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!started) return;
    let start = 0;
    const end = to;
    const increment = Math.ceil(end / (duration / 16));
    let raf;
    function update() {
      start += increment;
      if (start >= end) {
        setDisplay(end);
      } else {
        setDisplay(start);
        raf = requestAnimationFrame(update);
      }
    }
    setDisplay(0);
    raf = requestAnimationFrame(update);
    return () => raf && cancelAnimationFrame(raf);
  }, [to, duration, started]);

  return (
    <span ref={ref} {...props}>{display.toLocaleString()}{suffix}</span>
  );
}

const stats = [
  { number: '2M+', label: 'Donated to Charity', icon: <Heart className="w-6 h-6 text-[#5624d0]" /> },
  { number: '50K+', label: 'Active Learners', icon: <Users className="w-6 h-6 text-[#5624d0]" /> },
  { number: '1,200+', label: 'Expert Courses', icon: <BookOpen className="w-6 h-6 text-[#5624d0]" /> },
  { number: '180+', label: 'Countries Reached', icon: <Globe className="w-6 h-6 text-[#5624d0]" /> },
];

const timeline = [
  { year: 2020, event: 'EduCharity founded. Vision to democratize education and support charity.' },
  { year: 2021, event: 'First 10,000 learners. Partnered with local NGOs.' },
  { year: 2022, event: 'Expanded to 50,000+ users. Launched mobile app.' },
  { year: 2023, event: 'Reached 1M+ in donations. Added AI-powered learning.' },
  { year: 2024, event: 'Became Sri Lanka’s top charity learning platform.' },
];

const values = [
  {
    icon: <Heart className="w-8 h-8 text-[#5624d0]" />, title: 'Social Impact',
    description: 'Every course completion supports Sri Lankan charities and communities.'
  },
  {
    icon: <Target className="w-8 h-8 text-[#5624d0]" />, title: 'Quality Education',
    description: 'Expert content for practical skills, tailored for Sri Lankan learners.'
  },
  {
    icon: <Users className="w-8 h-8 text-[#5624d0]" />, title: 'Sinhala Community',
    description: 'Connect with Sinhala learners and instructors across Sri Lanka.'
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-[#5624d0]" />, title: 'Innovation',
    description: 'Cutting-edge tech and AI for a next-level learning experience.'
  }
];

const team = [
  {
    name: 'Nimal Perera',
    role: 'Founder & CEO',
    bio: 'Visionary leader passionate about empowering Sri Lankan youth through education.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=400&fit=crop',
    linkedin: '#',
    fun: 'Loves hoppers and cricket!'
  },
  {
    name: 'Kavindi Jayasinghe',
    role: 'Head of Community',
    bio: 'Community builder focused on connecting Sinhala learners and instructors.',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
    linkedin: '#',
    fun: 'Dances Kandyan and surfs Arugam Bay.'
  },
  {
    name: 'Sahan Fernando',
    role: 'Lead Engineer',
    bio: 'Tech enthusiast building scalable solutions for Sri Lankan education.',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop',
    linkedin: '#',
    fun: 'Can code and make the best milk tea!'
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-[#222] font-serif">Transforming Lives<br />Through Education & Impact</h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-8">Sri Lanka’s first charity-powered learning platform. Every course you complete helps a real cause.</p>
            <a href="/register" className="inline-block px-10 py-4 rounded-lg bg-[#5624d0] text-lg font-bold text-white shadow hover:bg-[#3d1a99] transition">Start Learning Now</a>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&h=400&fit=crop" alt="Learning Illustration" className="w-80 h-80 object-cover rounded-xl shadow" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow p-8 text-center border border-gray-100 hover:shadow-lg transition group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#f3f0fa] mb-4 mx-auto">{stat.icon}</div>
                <div className="text-4xl font-extrabold text-[#5624d0] mb-2">
                  {(() => {
                    const match = stat.number.match(/([\d,]+)([A-Za-z+]+)/);
                    if (match) {
                      const num = parseInt(match[1].replace(/,/g, ''));
                      const suffix = match[2];
                      return <AnimatedCounter to={num} duration={3000} suffix={suffix} />;
                    } else {
                      return <AnimatedCounter to={parseInt(stat.number.replace(/\D/g, ''))} duration={3000} />;
                    }
                  })()}
                </div>
                <div className="text-gray-700 text-lg font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-[#f3f0fa] border-t border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-[#222] mb-2">Our Growth Journey</h2>
            <p className="text-lg text-gray-500">How EduCharity has evolved over the years</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {timeline.map((item, idx) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow p-6 text-center border-2 border-[#f3f0fa] min-w-[180px] hover:shadow-lg transition"
              >
                <div className="text-2xl font-extrabold text-[#5624d0] mb-1">{item.year}</div>
                <div className="text-gray-700 text-base font-medium">{item.event}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[#fdf6fa]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-[#222] mb-2">Our Core Values</h2>
            <p className="text-lg text-gray-500">The principles that guide everything we do, from course creation to community building</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-[#f8f7fa] p-10 rounded-xl shadow hover:shadow-lg border border-[#f3f0fa] transition-all duration-300"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#f3f0fa] mb-6 mx-auto">{value.icon}</div>
                <h3 className="text-2xl font-extrabold text-[#5624d0] mb-3">{value.title}</h3>
                <p className="text-gray-700 text-lg">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-[#222] mb-2">Meet Our Team</h2>
            <p className="text-lg text-gray-500">The passionate Sri Lankan team working to democratize education and create positive impact</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.03 }}
                className="group bg-white p-8 rounded-xl shadow hover:shadow-lg border-2 border-[#f3f0fa] flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-[#5624d0] group-hover:scale-105 transition-transform shadow"
                  />
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow hover:bg-[#f3f0fa] transition-opacity opacity-0 group-hover:opacity-100">
                    <Linkedin className="w-5 h-5 text-[#5624d0]" />
                  </a>
                </div>
                <h3 className="text-xl font-extrabold text-[#5624d0] mb-1">{member.name}</h3>
                <p className="text-[#5624d0] font-semibold mb-1">{member.role}</p>
                <p className="text-gray-700 mb-2">{member.bio}</p>
                <div className="text-sm text-gray-500 italic">{member.fun}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#222] mb-6 font-serif">Join Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">Ready to be part of a learning community that's making a real difference in Sri Lanka? Start your journey today and contribute to positive change.</p>
          <a href="/register" className="inline-block px-10 py-4 rounded-lg bg-[#5624d0] text-lg font-bold text-white shadow hover:bg-[#3d1a99] transition">Start Learning Today</a>
        </div>
      </section>
    </div>
  );
}
