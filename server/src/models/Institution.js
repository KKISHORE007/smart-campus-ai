// ============================================================
// Student Helpdesk Agent — Model: Institution
// ============================================================
// Mongoose schema for college/university multi-tenancy.
// Stores institution identity, code, hero carousel slides, and UI branding tokens.
// ============================================================

import mongoose from 'mongoose';

const carouselSlideSchema = new mongoose.Schema({
  id: { type: String, required: true },
  url: { type: String, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
}, { _id: false });

const institutionSchema = new mongoose.Schema(
  {
    institutionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '🎓',
    },
    primaryColor: {
      type: String,
      default: '#1e3a8a',
    },
    secondaryColor: {
      type: String,
      default: '#3b82f6',
    },
    contactEmail: {
      type: String,
      default: 'helpdesk@xyzec.edu',
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    address: {
      type: String,
      default: 'Knowledge Campus, Tech Valley, Bangalore 560001',
    },
    locationUrl: {
      type: String,
      default: 'https://maps.google.com/?q=XYZ+Engineering+College',
    },
    website: {
      type: String,
      default: 'https://www.xyzec.edu',
    },
    motto: {
      type: String,
      default: 'Excellence in Engineering & Innovation Since 1998',
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    },
    videoTourUrl: {
      type: String,
      default: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    heroCarouselImages: {
      type: [carouselSlideSchema],
      default: [
        { id: 'slide-1', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80', title: 'XYZ Engineering College Campus', subtitle: 'Excellence in Engineering & Innovation Since 1998' },
        { id: 'slide-2', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80', title: 'AI & Robotics Innovation Center', subtitle: 'State-of-the-art NVIDIA GPU clusters for student projects' },
        { id: 'slide-3', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80', title: 'Collaborative Learning Spaces', subtitle: '24/7 Digital Library and student research hubs' },
        { id: 'slide-4', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80', title: 'Annual InnoVision Tech Fest', subtitle: 'Over 400 teams competing for innovation grants' }
      ]
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Institution = mongoose.model('Institution', institutionSchema);
export default Institution;
