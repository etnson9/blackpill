# BLACKPILL FORUM

## Overview

BLACKPILL FORUM is a modern web forum application built with React and Vite, designed for self-improvement discussions across multiple specialized categories. The forum features a comprehensive user system with authentication, voting mechanisms, anonymous posting capabilities, and admin moderation tools. The application supports both desktop and mobile devices with a responsive design and includes dark mode functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with Vite for fast development and building
- **Routing**: React Router DOM for client-side navigation
- **Styling**: Tailwind CSS with custom dark theme implementation
- **State Management**: Context API for authentication and settings management
- **UI Notifications**: React Hot Toast for user feedback
- **Icons**: React Icons library for consistent iconography

### Authentication System
- **Provider**: Supabase Auth for user registration, login, and session management
- **Context Pattern**: Custom AuthProvider context wraps the entire application
- **Role-based Access**: Admin panel restricted to users with admin role
- **Anonymous Posting**: Support for anonymous posts while maintaining user session

### Data Layer
- **Database**: Supabase (PostgreSQL) as backend-as-a-service
- **Real-time Updates**: Supabase subscriptions for live post and comment updates
- **Schema Design**: Normalized tables for users, categories, posts, comments, and votes
- **Voting System**: Prevents duplicate votes per user with dedicated votes table

### Component Architecture
- **Layout System**: Centralized Layout component with Navbar and Sidebar
- **Page Components**: Dedicated pages for Home, Category, Post, NewPost, Login, Register, and Admin
- **Reusable Components**: PostCard, CommentCard, UpvoteDownvote, Badge, NSFWFilter
- **Admin Panel**: Comprehensive moderation interface for content and user management

### Content Management
- **Categories**: Predefined forum categories with descriptions (FITNESS, STYLE, TECH, etc.)
- **NSFW Filtering**: User-configurable content filtering with toggle option
- **Badge System**: User ranking based on post count, upvotes, and engagement
- **Moderation**: Admin controls for posts, comments, users, and NSFW content

### Responsive Design
- **Mobile-First**: Tailwind CSS responsive utilities for all screen sizes
- **Dark Mode**: CSS class-based theme switching with smooth transitions
- **Accessibility**: Semantic HTML structure and proper contrast ratios

## External Dependencies

### Primary Services
- **Supabase**: Database, authentication, and real-time subscriptions
  - PostgreSQL database hosting
  - Row Level Security (RLS) policies
  - Real-time WebSocket connections
  - User authentication and authorization

### Frontend Libraries
- **React Router DOM**: Client-side routing and navigation
- **React Hot Toast**: Toast notification system
- **React Icons**: Icon library for UI elements
- **Day.js**: Date formatting and manipulation
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Autoprefixer**: CSS vendor prefix automation

### Development Tools
- **Vite**: Build tool and development server
- **@vitejs/plugin-react**: React plugin for Vite
- **PostCSS**: CSS processing and transformation

### Environment Configuration
- **VITE_SUPABASE_URL**: Supabase project URL
- **VITE_SUPABASE_ANON_KEY**: Supabase anonymous access key