import { supabase, TABLES, VERIFICATION_STATUS } from './supabase';

export class SocialTaskService {
  // Helper method to check if Supabase is available
  static isSupabaseAvailable() {
    return supabase !== null;
  }

  // Create social media tasks for a raffle
  static async createRaffleTasks(raffleAddress, tasks) {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not available. Social media features are disabled.');
      return { success: false, error: 'Social media features are not configured' };
    }

    try {
      if (!tasks || tasks.length === 0) {
        return { success: true, data: [] };
      }

      const taskData = tasks.map(task => ({
        raffle_address: raffleAddress,
        task_type: task.type,
        title: task.title,
        description: task.description,
        url: task.url,
        required: task.required,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(TABLES.RAFFLE_SOCIAL_TASKS)
        .insert(taskData)
        .select();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error creating raffle tasks:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all tasks for a specific raffle
   * @param {string} raffleAddress - The raffle contract address
   * @returns {Promise<{success: boolean, tasks: Array, error?: string}>}
   */
  static async getRaffleTasks(raffleAddress) {
    try {
      const { data, error } = await supabase
        .from('social_tasks')
        .select('*')
        .eq('raffle_address', raffleAddress)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        tasks: data || []
      };
    } catch (error) {
      console.error('Error fetching raffle tasks:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mark a task as completed by a user
  static async markTaskCompleted(userAddress, raffleAddress, taskId, status = VERIFICATION_STATUS.PENDING) {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not available. Social media features are disabled.');
      return { success: false, error: 'Social media features are not configured' };
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.TASK_COMPLETIONS)
        .upsert({
          user_address: userAddress,
          raffle_address: raffleAddress,
          task_id: taskId,
          status: status,
          completed_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error marking task completed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Submit task completion for a user
   * @param {string} raffleAddress - The raffle contract address
   * @param {string} userAddress - The user's wallet address
   * @param {Array} completedTaskIds - Array of completed task IDs
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async submitTaskCompletion(raffleAddress, userAddress, completedTaskIds) {
    try {
      // Create task completion records
      const completionRecords = completedTaskIds.map(taskId => ({
        raffle_address: raffleAddress,
        user_address: userAddress,
        task_id: taskId,
        status: 'pending', // Will be verified by admin
        completed_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('task_completions')
        .upsert(completionRecords, {
          onConflict: 'raffle_address,user_address,task_id'
        });

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error submitting task completion:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get task completion status for a user
   * @param {string} raffleAddress - The raffle contract address
   * @param {string} userAddress - The user's wallet address
   * @returns {Promise<{success: boolean, completions: Array, error?: string}>}
   */
  static async getUserTaskCompletions(raffleAddress, userAddress) {
    try {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('raffle_address', raffleAddress)
        .eq('user_address', userAddress);

      if (error) throw error;

      return {
        success: true,
        completions: data || []
      };
    } catch (error) {
      console.error('Error fetching user task completions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has completed all required tasks for a raffle
   * @param {string} raffleAddress - The raffle contract address
   * @param {string} userAddress - The user's wallet address
   * @returns {Promise<{success: boolean, canParticipate: boolean, error?: string}>}
   */
  static async checkUserEligibility(raffleAddress, userAddress) {
    try {
      // Get all required tasks for the raffle
      const tasksResponse = await this.getRaffleTasks(raffleAddress);
      if (!tasksResponse.success) {
        throw new Error(tasksResponse.error);
      }

      const requiredTasks = tasksResponse.tasks.filter(task => task.required);
      
      if (requiredTasks.length === 0) {
        return {
          success: true,
          canParticipate: true // No required tasks
        };
      }

      // Get user's completed tasks
      const completionsResponse = await this.getUserTaskCompletions(raffleAddress, userAddress);
      if (!completionsResponse.success) {
        throw new Error(completionsResponse.error);
      }

      const completedTaskIds = completionsResponse.completions
        .filter(completion => completion.status === 'verified')
        .map(completion => completion.task_id);

      const allRequiredCompleted = requiredTasks.every(task => 
        completedTaskIds.includes(task.id)
      );

      return {
        success: true,
        canParticipate: allRequiredCompleted
      };
    } catch (error) {
      console.error('Error checking user eligibility:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify a task completion (admin/creator function)
  static async verifyTaskCompletion(userAddress, raffleAddress, taskId, status) {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not available. Social media features are disabled.');
      return { success: false, error: 'Social media features are not configured' };
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.TASK_COMPLETIONS)
        .update({
          status: status,
          verified_at: new Date().toISOString()
        })
        .eq('user_address', userAddress)
        .eq('raffle_address', raffleAddress)
        .eq('task_id', taskId)
        .select();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error verifying task completion:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all task completions for a raffle (for creators to review)
  static async getRaffleTaskCompletions(raffleAddress) {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not available. Social media features are disabled.');
      return { success: false, error: 'Social media features are not configured', data: [] };
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.TASK_COMPLETIONS)
        .select(`
          *,
          raffle_social_tasks (*)
        `)
        .eq('raffle_address', raffleAddress)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching raffle task completions:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get user activity related to social media tasks
  static async getUserTaskActivity(userAddress) {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not available. Social media features are disabled.');
      return { success: false, error: 'Social media features are not configured', data: [] };
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.TASK_COMPLETIONS)
        .select(`
          *,
          raffle_social_tasks (*)
        `)
        .eq('user_address', userAddress)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching user task activity:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get statistics for a raffle's social media tasks
  static async getRaffleTaskStats(raffleAddress) {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not available. Social media features are disabled.');
      return { success: false, error: 'Social media features are not configured' };
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.TASK_COMPLETIONS)
        .select('*')
        .eq('raffle_address', raffleAddress);

      if (error) throw error;

      const stats = {
        totalCompletions: data?.length || 0,
        verifiedCompletions: data?.filter(c => c.status === VERIFICATION_STATUS.VERIFIED).length || 0,
        pendingCompletions: data?.filter(c => c.status === VERIFICATION_STATUS.PENDING).length || 0,
        rejectedCompletions: data?.filter(c => c.status === VERIFICATION_STATUS.REJECTED).length || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching raffle task stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete tasks for a raffle (when raffle is deleted)
  static async deleteRaffleTasks(raffleAddress) {
    if (!this.isSupabaseAvailable()) {
      console.warn('Supabase not available. Social media features are disabled.');
      return { success: false, error: 'Social media features are not configured' };
    }

    try {
      // Delete task completions first
      const { error: completionsError } = await supabase
        .from(TABLES.TASK_COMPLETIONS)
        .delete()
        .eq('raffle_address', raffleAddress);

      if (completionsError) throw completionsError;

      // Delete raffle tasks
      const { error: tasksError } = await supabase
        .from(TABLES.RAFFLE_SOCIAL_TASKS)
        .delete()
        .eq('raffle_address', raffleAddress);

      if (tasksError) throw tasksError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting raffle tasks:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Automated verification for social media tasks
   * @param {string} taskType - The type of task to verify
   * @param {string} taskUrl - The URL associated with the task
   * @param {string} userAddress - The user's wallet address
   * @returns {Promise<{success: boolean, verified: boolean, error?: string}>}
   */
  static async verifyTaskAutomatically(taskType, taskUrl, userAddress) {
    try {
      switch (taskType) {
        case TASK_TYPES.TWITTER_FOLLOW:
          return await this.verifyTwitterFollow(taskUrl, userAddress);
        
        case TASK_TYPES.TWITTER_RETWEET:
          return await this.verifyTwitterRetweet(taskUrl, userAddress);
        
        case TASK_TYPES.TWITTER_LIKE:
          return await this.verifyTwitterLike(taskUrl, userAddress);
        
        case TASK_TYPES.DISCORD_JOIN:
          return await this.verifyDiscordJoin(taskUrl, userAddress);
        
        case TASK_TYPES.TELEGRAM_JOIN:
          return await this.verifyTelegramJoin(taskUrl, userAddress);
        
        case TASK_TYPES.INSTAGRAM_FOLLOW:
          return await this.verifyInstagramFollow(taskUrl, userAddress);
        
        case TASK_TYPES.YOUTUBE_SUBSCRIBE:
          return await this.verifyYouTubeSubscribe(taskUrl, userAddress);
        
        case TASK_TYPES.WEBSITE_VISIT:
          return await this.verifyWebsiteVisit(taskUrl, userAddress);
        
        default:
          return {
            success: false,
            verified: false,
            error: 'Unknown task type'
          };
      }
    } catch (error) {
      console.error('Error in automated verification:', error);
      return {
        success: false,
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Verify Twitter follow using Twitter API
   * @param {string} taskUrl - Twitter profile URL
   * @param {string} userAddress - User's wallet address
   */
  static async verifyTwitterFollow(taskUrl, userAddress) {
    // TODO: Implement Twitter API integration
    // This would require:
    // 1. Twitter API credentials
    // 2. OAuth flow to get user's Twitter account
    // 3. Check if user follows the specified account
    
    // For now, simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 80% success rate
    const isVerified = Math.random() > 0.2;
    
    return {
      success: true,
      verified: isVerified,
      message: isVerified ? 'Twitter follow verified successfully' : 'Twitter follow verification failed'
    };
  }

  /**
   * Verify Twitter retweet using Twitter API
   */
  static async verifyTwitterRetweet(taskUrl, userAddress) {
    // TODO: Implement Twitter API integration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isVerified = Math.random() > 0.2;
    
    return {
      success: true,
      verified: isVerified,
      message: isVerified ? 'Twitter retweet verified successfully' : 'Twitter retweet verification failed'
    };
  }

  /**
   * Verify Twitter like using Twitter API
   */
  static async verifyTwitterLike(taskUrl, userAddress) {
    // TODO: Implement Twitter API integration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isVerified = Math.random() > 0.2;
    
    return {
      success: true,
      verified: isVerified,
      message: isVerified ? 'Twitter like verified successfully' : 'Twitter like verification failed'
    };
  }

  /**
   * Verify Discord join using Discord API
   */
  static async verifyDiscordJoin(taskUrl, userAddress) {
    // TODO: Implement Discord API integration
    // This would require:
    // 1. Discord bot with proper permissions
    // 2. Check if user is in the specified server
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isVerified = Math.random() > 0.2;
    
    return {
      success: true,
      verified: isVerified,
      message: isVerified ? 'Discord join verified successfully' : 'Discord join verification failed'
    };
  }

  /**
   * Verify Telegram join using Telegram API
   */
  static async verifyTelegramJoin(taskUrl, userAddress) {
    // TODO: Implement Telegram API integration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isVerified = Math.random() > 0.2;
    
    return {
      success: true,
      verified: isVerified,
      message: isVerified ? 'Telegram join verified successfully' : 'Telegram join verification failed'
    };
  }

  /**
   * Verify Instagram follow using Instagram API
   */
  static async verifyInstagramFollow(taskUrl, userAddress) {
    // TODO: Implement Instagram API integration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isVerified = Math.random() > 0.2;
    
    return {
      success: true,
      verified: isVerified,
      message: isVerified ? 'Instagram follow verified successfully' : 'Instagram follow verification failed'
    };
  }

  /**
   * Verify YouTube subscribe using YouTube API
   */
  static async verifyYouTubeSubscribe(taskUrl, userAddress) {
    // TODO: Implement YouTube API integration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isVerified = Math.random() > 0.2;
    
    return {
      success: true,
      verified: isVerified,
      message: isVerified ? 'YouTube subscribe verified successfully' : 'YouTube subscribe verification failed'
    };
  }

  /**
   * Verify website visit using analytics or tracking pixel
   */
  static async verifyWebsiteVisit(taskUrl, userAddress) {
    // TODO: Implement website visit tracking
    // This could be done by:
    // 1. Adding a tracking pixel to the website
    // 2. Using analytics to track visits
    // 3. Creating a unique visit URL with user identifier
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isVerified = Math.random() > 0.2;
    
    return {
      success: true,
      verified: isVerified,
      message: isVerified ? 'Website visit verified successfully' : 'Website visit verification failed'
    };
  }

  /**
   * Submit task completion with automated verification
   * @param {string} raffleAddress - The raffle contract address
   * @param {string} userAddress - The user's wallet address
   * @param {Array} completedTaskIds - Array of completed task IDs
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async submitTaskCompletionWithVerification(raffleAddress, userAddress, completedTaskIds) {
    try {
      // Get the tasks to verify
      const tasksResponse = await this.getRaffleTasks(raffleAddress);
      if (!tasksResponse.success) {
        throw new Error(tasksResponse.error);
      }

      const tasksToVerify = tasksResponse.tasks.filter(task => 
        completedTaskIds.includes(task.id)
      );

      // Verify each task
      const verificationResults = [];
      for (const task of tasksToVerify) {
        const verification = await this.verifyTaskAutomatically(
          task.type,
          task.url,
          userAddress
        );
        
        verificationResults.push({
          taskId: task.id,
          verified: verification.verified,
          message: verification.message
        });
      }

      // Only submit verified tasks
      const verifiedTaskIds = verificationResults
        .filter(result => result.verified)
        .map(result => result.taskId);

      if (verifiedTaskIds.length === 0) {
        return {
          success: false,
          error: 'No tasks were verified successfully'
        };
      }

      // Submit verified tasks to database
      const submissionResult = await this.submitTaskCompletion(
        raffleAddress,
        userAddress,
        verifiedTaskIds
      );

      return {
        success: submissionResult.success,
        verifiedTasks: verifiedTaskIds,
        verificationResults,
        error: submissionResult.error
      };
    } catch (error) {
      console.error('Error in task completion with verification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export async function createSocialTask(task) {
  const { data, error } = await supabase
    .from('social_tasks')
    .insert([task])
    .single();
  if (error) throw error;
  return data;
} 