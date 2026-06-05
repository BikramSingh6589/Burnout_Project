import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Message sent:', formData);
    alert("Thank you for reaching out! We'll get back to you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Get in Touch</h1>
          <p className="text-xl text-foreground-muted">
            Have questions about BurnoutGuard? Need technical support or want to suggest a feature? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface rounded-xl shadow-card p-6 border border-border flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Email Us</h3>
                <p className="text-foreground-muted mt-1">For support and general queries.</p>
                <a href="mailto:support@burnoutguard.com" className="text-primary font-medium mt-2 inline-block hover:underline">support@burnoutguard.com</a>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-card p-6 border border-border flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Call Us</h3>
                <p className="text-foreground-muted mt-1">Mon-Fri from 9am to 6pm.</p>
                <p className="text-foreground font-medium mt-2">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-card p-6 border border-border flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Visit Us</h3>
                <p className="text-foreground-muted mt-1">Student Wellness Center</p>
                <p className="text-foreground font-medium mt-2">123 University Ave<br/>Innovation District, CA 90210</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-surface rounded-2xl shadow-card p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1" htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1" htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1" htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="How can we help you?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="bg-primary text-white rounded-md h-12 px-8 font-medium transition-shadow hover:shadow-hover flex items-center gap-2 cursor-pointer">
                <Send className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>

        </div>
      </main>

      <footer className="bg-background py-8 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-foreground-muted">© 2026 Academic Burnout Prediction Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
