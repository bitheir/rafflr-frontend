# 🧪 Social Media Features Testing Guide

## Testing Checklist

### ✅ **Setup Verification**
- [ ] Development server starts without errors
- [ ] All UI components render properly
- [ ] Tailwind CSS styles are applied correctly
- [ ] No console errors in browser

### 🎯 **Social Media Task Creator Testing**

**Test URL**: `http://localhost:5173/test-social`

#### 1. Basic Functionality
- [ ] Task creator component loads
- [ ] "Enable social media tasks" toggle works
- [ ] Can add new tasks
- [ ] Can remove tasks
- [ ] Can edit task details (title, description, URL)
- [ ] Task type dropdown shows all options

#### 2. Task Types
- [ ] Twitter Follow
- [ ] Twitter Retweet
- [ ] Twitter Like
- [ ] Discord Join
- [ ] Telegram Join
- [ ] Instagram Follow
- [ ] YouTube Subscribe
- [ ] Website Visit

#### 3. Task Properties
- [ ] Required/Optional toggle works
- [ ] URL validation (optional)
- [ ] Task counter updates correctly

### 📋 **Social Media Task Completion Testing**

#### 1. Task Display
- [ ] Tasks show with correct icons
- [ ] Required tasks are marked
- [ ] Task descriptions display properly
- [ ] URLs open in new tab

#### 2. Task Completion Flow
- [ ] "Complete" button works
- [ ] Tasks show "Pending" status after completion
- [ ] All required tasks completion enables purchase
- [ ] Task status badges update correctly

### 🏠 **Create Raffle Page Integration**

**Test URL**: `http://localhost:5173/create-raffle`

#### 1. Social Tasks Integration
- [ ] Social task section appears in Prized Raffle form
- [ ] Can add tasks during raffle creation
- [ ] Tasks are saved with raffle (when database is connected)
- [ ] Form validation works with tasks

### 🎫 **Raffle Detail Page Integration**

**Test URL**: `http://localhost:5173/raffle/[any-raffle-address]`

#### 1. Task Display
- [ ] Social tasks section appears for raffles with tasks
- [ ] Tasks load correctly (when database is connected)
- [ ] Purchase button is disabled until tasks completed
- [ ] Task completion flow works

### 👤 **Profile Page Enhancement**

**Test URL**: `http://localhost:5173/profile`

#### 1. New Tab System
- [ ] Activity tab loads
- [ ] Created Raffles tab loads
- [ ] Purchased Tickets tab loads
- [ ] Creator Dashboard tab loads

#### 2. Tab Functionality
- [ ] Tab switching works smoothly
- [ ] Each tab shows appropriate content
- [ ] No errors when switching tabs

### 🗄️ **Database Integration Testing**

#### 1. Supabase Connection
- [ ] Environment variables are set correctly
- [ ] Database connection works
- [ ] Tables are created properly
- [ ] Row Level Security is configured

#### 2. Data Operations
- [ ] Can create social tasks
- [ ] Can mark tasks as completed
- [ ] Can verify task completion status
- [ ] User activity is tracked

## 🚨 **Common Issues & Solutions**

### Issue: "Cannot find package '@tailwindcss/vite'"
**Solution**: ✅ Fixed - Removed problematic import from vite.config.js

### Issue: PostCSS parsing errors
**Solution**: ✅ Fixed - Added proper Tailwind directives to index.css

### Issue: Missing CSS variables
**Solution**: ✅ Fixed - Added theme CSS variables

### Issue: Components not rendering
**Check**: 
- Import statements are correct
- All dependencies are installed
- No JavaScript errors in console

## 🎯 **Test Scenarios**

### Scenario 1: Create Raffle with Social Tasks
1. Go to Create Raffle page
2. Fill in raffle details
3. Enable social media tasks
4. Add Twitter follow task
5. Add Discord join task
6. Create raffle
7. Verify tasks are saved

### Scenario 2: Complete Social Tasks
1. Visit raffle detail page
2. See social tasks section
3. Click "Open" for Twitter task
4. Complete the task manually
5. Click "Complete" button
6. Repeat for Discord task
7. Verify purchase button becomes active

### Scenario 3: Profile Activity Tracking
1. Complete some social tasks
2. Go to Profile page
3. Check Activity tab
4. Verify task completions are recorded
5. Check Created Raffles tab
6. Verify social task analytics

## 📊 **Performance Testing**

- [ ] Page load times are acceptable
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Responsive design works

## 🔒 **Security Testing**

- [ ] User can only see their own task completions
- [ ] Database queries are secure
- [ ] No sensitive data exposed
- [ ] Input validation works

## 📱 **Responsive Testing**

- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Touch interactions work

## 🎨 **UI/UX Testing**

- [ ] Consistent design language
- [ ] Proper spacing and alignment
- [ ] Color scheme works in both themes
- [ ] Icons are appropriate
- [ ] Loading states are clear

## 🚀 **Ready for Production Checklist**

- [ ] All tests pass
- [ ] No console errors
- [ ] Database is properly configured
- [ ] Environment variables are set
- [ ] Documentation is complete
- [ ] Code is committed to Git

---

**Test Results**: 
- Date: _________
- Tester: _________
- Status: ⏳ In Progress / ✅ Complete / ❌ Failed
- Notes: _________ 