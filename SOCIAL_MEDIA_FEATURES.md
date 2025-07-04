# Social Media Marketing Features

## Overview

Rafflhub now includes powerful social media marketing features that allow raffle creators to require participants to complete social media tasks before purchasing tickets. This creates viral marketing opportunities and increases engagement.

## Features

### 🎯 Social Media Tasks
- **Twitter Tasks**: Follow accounts, retweet posts, like tweets
- **Discord Tasks**: Join Discord servers
- **Telegram Tasks**: Join Telegram groups
- **Instagram Tasks**: Follow Instagram accounts
- **YouTube Tasks**: Subscribe to YouTube channels
- **Website Tasks**: Visit specific websites

### 📊 Enhanced Profile System
- **Activity Tab**: Track all user actions and social media task completions
- **Created Raffles**: Manage raffles you've created with social task analytics
- **Purchased Tickets**: View tickets purchased and task completion status
- **Creator Dashboard**: Analytics and management tools for creators

## Setup Instructions

### 1. Database Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up/Login with GitHub
   - Create new project: `rafflhub-social-tasks`
   - Save your database password

2. **Get Credentials**:
   - In Supabase dashboard → Settings → API
   - Copy "Project URL" and "anon public" key
   - Create `.env` file in project root:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Create Database Tables**:
   - Go to Supabase SQL Editor
   - Run the SQL commands from `SUPABASE_SETUP.md`

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 3. Restart Development Server

```bash
npm run dev
```

## How It Works

### For Raffle Creators

1. **Create Raffle with Social Tasks**:
   - Go to "Create Raffle" page
   - Fill in raffle details
   - Scroll to "Social Media Tasks" section
   - Toggle "Enable social media tasks"
   - Add tasks (Twitter follow, Discord join, etc.)
   - Set task requirements (required/optional)
   - Create raffle

2. **Monitor Task Completion**:
   - View task completion statistics in your raffle
   - Verify task completions manually if needed
   - Track engagement metrics

### For Participants

1. **View Raffle with Tasks**:
   - Visit raffle detail page
   - See required social media tasks
   - Click "Open" to visit social media links
   - Complete tasks (follow, join, etc.)

2. **Mark Tasks as Complete**:
   - Click "Complete" button for each task
   - Tasks are marked as "Pending" for verification
   - Once verified, "Purchase Ticket" button becomes active

3. **Purchase Tickets**:
   - Complete all required tasks
   - Purchase tickets normally
   - Track your activity in Profile page

## Database Schema

### Tables

1. **raffle_social_tasks**: Stores tasks for each raffle
2. **task_completions**: Tracks user task completion status
3. **user_activity**: Records all user actions

### Task Types

- `twitter_follow`: Follow Twitter account
- `twitter_retweet`: Retweet specific post
- `twitter_like`: Like specific tweet
- `discord_join`: Join Discord server
- `telegram_join`: Join Telegram group
- `instagram_follow`: Follow Instagram account
- `youtube_subscribe`: Subscribe to YouTube channel
- `website_visit`: Visit website

### Verification Status

- `pending`: Task marked as completed, awaiting verification
- `verified`: Task verified and approved
- `rejected`: Task rejected (requires re-completion)

## Benefits

### For Creators
- **Viral Marketing**: Automatic social media promotion
- **Increased Reach**: Participants share your content
- **Engagement Tracking**: Monitor task completion rates
- **Community Building**: Grow social media presence

### For Participants
- **Fair Access**: Transparent task requirements
- **Engagement Rewards**: Complete tasks to participate
- **Activity Tracking**: See your participation history

## Technical Implementation

### Components
- `SocialTaskCreator`: Add tasks during raffle creation
- `SocialTaskCompletion`: Complete tasks before ticket purchase
- `ProfileTabs`: Enhanced profile with activity tracking

### Services
- `SocialTaskService`: Database operations for tasks
- `supabase.js`: Database connection and configuration

### Integration Points
- **CreateRafflePage**: Add social tasks during creation
- **RaffleDetailPage**: Show task completion interface
- **ProfilePage**: Display activity and task history

## Future Enhancements

1. **Automated Verification**: API integration for automatic task verification
2. **Advanced Analytics**: Detailed engagement metrics
3. **Task Templates**: Pre-built task templates for common use cases
4. **Reward System**: Bonus rewards for completing extra tasks
5. **Social Proof**: Display task completion counts publicly

## Troubleshooting

### Common Issues

1. **Tasks not loading**: Check Supabase connection and environment variables
2. **Task completion not saving**: Verify database permissions and user authentication
3. **Purchase button disabled**: Ensure all required tasks are completed and verified

### Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase project setup
3. Ensure environment variables are correct
4. Check database table creation

## Security Considerations

- Task completion is self-reported for MVP
- Manual verification available for creators
- Database uses Row Level Security (RLS)
- User addresses are used for authentication
- No sensitive data stored in plain text 