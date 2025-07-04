# Social Media Task Verification System

## Overview

The social media task verification system provides automated verification of user actions across various social media platforms. Users simply click the "Complete Task" button, which opens the social media link and automatically verifies their completion after a few seconds.

## How It Works

### 1. User Flow
1. User clicks "Complete Task" button
2. Social media link opens in new tab
3. User completes the action (follow, join, etc.)
4. System automatically verifies completion after 2-3 seconds
5. Task is marked as completed if verification succeeds

### 2. Verification Process
- **Immediate**: Task enters "Verifying..." state
- **Background**: Automated API calls check user's social media status
- **Result**: Task is marked as completed or remains incomplete

## Current Implementation

### Mock Verification (Demo Mode)
- Simulates verification with 80% success rate
- 2-second delay to mimic real API calls
- Used for testing and demonstration

### Real API Integration (Production)

#### Twitter API Integration
```javascript
// Required: Twitter API v2 credentials
const verifyTwitterFollow = async (taskUrl, userAddress) => {
  // 1. Get user's Twitter account via OAuth
  // 2. Check if user follows the specified account
  // 3. Return verification result
};
```

#### Discord API Integration
```javascript
// Required: Discord bot with server permissions
const verifyDiscordJoin = async (taskUrl, userAddress) => {
  // 1. Extract server ID from invite link
  // 2. Check if user is member of the server
  // 3. Return verification result
};
```

#### Instagram API Integration
```javascript
// Required: Instagram Basic Display API
const verifyInstagramFollow = async (taskUrl, userAddress) => {
  // 1. Get user's Instagram account via OAuth
  // 2. Check if user follows the specified account
  // 3. Return verification result
};
```

#### YouTube API Integration
```javascript
// Required: YouTube Data API v3
const verifyYouTubeSubscribe = async (taskUrl, userAddress) => {
  // 1. Get user's YouTube account via OAuth
  // 2. Check if user is subscribed to the channel
  // 3. Return verification result
};
```

## API Integration Requirements

### Twitter API
- **API Version**: Twitter API v2
- **Required Scopes**: `users.read`, `follows.read`
- **OAuth Flow**: User authorization required
- **Rate Limits**: 300 requests per 15 minutes

### Discord API
- **API Version**: Discord API v10
- **Required Permissions**: `guilds.read`
- **Bot Token**: Required for server access
- **Rate Limits**: 50 requests per second

### Instagram API
- **API Version**: Instagram Basic Display API
- **Required Scopes**: `user_profile`, `user_media`
- **OAuth Flow**: User authorization required
- **Rate Limits**: 200 requests per hour

### YouTube API
- **API Version**: YouTube Data API v3
- **Required Scopes**: `https://www.googleapis.com/auth/youtube.readonly`
- **OAuth Flow**: User authorization required
- **Rate Limits**: 10,000 requests per day

## Implementation Steps

### 1. Environment Setup
```bash
# Add API credentials to .env
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
INSTAGRAM_APP_ID=your_instagram_app_id
YOUTUBE_API_KEY=your_youtube_api_key
```

### 2. OAuth Integration
```javascript
// Example: Twitter OAuth flow
const initiateTwitterAuth = async (userAddress) => {
  // 1. Generate OAuth URL
  // 2. Redirect user to Twitter
  // 3. Handle callback and store tokens
  // 4. Associate tokens with user address
};
```

### 3. Verification Functions
Replace the mock implementations in `socialTaskService.js`:

```javascript
// Replace this mock function
static async verifyTwitterFollow(taskUrl, userAddress) {
  // Get user's Twitter tokens from database
  const userTokens = await getUserTwitterTokens(userAddress);
  
  // Make API call to check follow status
  const response = await twitterApi.get(`/2/users/${userId}/following/${targetUserId}`, {
    headers: { Authorization: `Bearer ${userTokens.access_token}` }
  });
  
  return {
    success: true,
    verified: response.data.length > 0,
    message: response.data.length > 0 ? 'Follow verified' : 'Follow not found'
  };
}
```

### 4. Database Schema
```sql
-- Store user social media tokens
CREATE TABLE user_social_tokens (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(42) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_address, platform)
);

-- Store verification attempts
CREATE TABLE task_verifications (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES social_tasks(id),
  user_address VARCHAR(42) NOT NULL,
  verification_status VARCHAR(20) NOT NULL,
  verification_message TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations

### 1. Token Storage
- Encrypt access tokens in database
- Use secure environment variables
- Implement token refresh logic

### 2. Rate Limiting
- Respect API rate limits
- Implement exponential backoff
- Queue verification requests

### 3. User Privacy
- Only request necessary permissions
- Clear data retention policies
- Allow users to revoke access

## Testing

### 1. Mock Testing
```javascript
// Test with mock data
const mockTasks = [
  {
    id: 1,
    type: TASK_TYPES.TWITTER_FOLLOW,
    url: 'https://twitter.com/testaccount'
  }
];
```

### 2. Integration Testing
```javascript
// Test with real API credentials
const testVerification = async () => {
  const result = await SocialTaskService.verifyTaskAutomatically(
    TASK_TYPES.TWITTER_FOLLOW,
    'https://twitter.com/testaccount',
    '0x123...'
  );
  console.log('Verification result:', result);
};
```

## Deployment Checklist

- [ ] Set up API credentials for all platforms
- [ ] Implement OAuth flows
- [ ] Replace mock verification functions
- [ ] Set up database tables
- [ ] Configure rate limiting
- [ ] Test with real social media accounts
- [ ] Monitor API usage and costs
- [ ] Set up error monitoring and alerts

## Future Enhancements

1. **Webhook Support**: Real-time verification via platform webhooks
2. **Analytics Dashboard**: Track verification success rates
3. **Retry Logic**: Automatic retry for failed verifications
4. **Batch Verification**: Verify multiple tasks simultaneously
5. **Fallback Methods**: Alternative verification methods for edge cases 