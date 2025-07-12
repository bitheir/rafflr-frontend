import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TASK_TYPES } from '../lib/supabase';
import { SocialTaskService } from '../lib/socialTaskService';
import { toast } from './ui/sonner';

const SocialTaskCompletion = ({ raffleAddress, onTasksCompleted }) => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [verifyingTasks, setVerifyingTasks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [raffleAddress]);

  const fetchTasks = async () => {
    try {
      // TODO: Replace with actual API call to fetch tasks for this raffle
      // const response = await SocialTaskService.getRaffleTasks(raffleAddress);
      // setTasks(response.tasks || []);
      
      // For now, using mock data
      setTasks([
        {
          id: 1,
          type: TASK_TYPES.TWITTER_FOLLOW,
          title: 'Follow our Twitter',
          description: 'Follow our official Twitter account to stay updated',
          url: 'https://twitter.com/example',
          required: true
        },
        {
          id: 2,
          type: TASK_TYPES.DISCORD_JOIN,
          title: 'Join our Discord',
          description: 'Join our Discord community for exclusive updates',
          url: 'https://discord.gg/example',
          required: true
        }
      ]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTaskUrl = async (task) => {
    // Open the social media link
    window.open(task.url, '_blank', 'noopener,noreferrer');
    
    // Start automated verification process
    await startAutomatedVerification(task);
  };

  const startAutomatedVerification = async (task) => {
    // Add task to verifying state
    setVerifyingTasks(prev => new Set(prev).add(task.id));

    try {
      // Use the automated verification service
      const verificationResult = await SocialTaskService.verifyTaskAutomatically(
        task.type,
        task.url,
        'user-wallet-address' // TODO: Get actual user wallet address
      );
      
      if (verificationResult.success && verificationResult.verified) {
        // Mark task as completed
        setCompletedTasks(prev => new Set(prev).add(task.id));
        toast.success(`Task ${task.id} verified automatically: ${verificationResult.message}`);
      } else {
        toast.error(`Task ${task.id} verification failed: ${verificationResult.message}`);
      }
    } catch (error) {
      console.error('Error during automated verification:', error);
      toast.error('Error during automated verification. Please try again.');
    } finally {
      // Remove from verifying state
      setVerifyingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  const getTaskIcon = (type) => {
    const iconMap = {
      [TASK_TYPES.TWITTER_FOLLOW]: '🐦',
      [TASK_TYPES.TWITTER_RETWEET]: '🔄',
      [TASK_TYPES.TWITTER_LIKE]: '❤️',
      [TASK_TYPES.DISCORD_JOIN]: '🎮',
      [TASK_TYPES.TELEGRAM_JOIN]: '📱',
      [TASK_TYPES.INSTAGRAM_FOLLOW]: '📸',
      [TASK_TYPES.YOUTUBE_SUBSCRIBE]: '📺',
      [TASK_TYPES.WEBSITE_VISIT]: '🌐'
    };
    return iconMap[type] || '📋';
  };

  const getTaskTypeLabel = (type) => {
    const labelMap = {
      [TASK_TYPES.TWITTER_FOLLOW]: 'Twitter Follow',
      [TASK_TYPES.TWITTER_RETWEET]: 'Twitter Retweet',
      [TASK_TYPES.TWITTER_LIKE]: 'Twitter Like',
      [TASK_TYPES.DISCORD_JOIN]: 'Discord Join',
      [TASK_TYPES.TELEGRAM_JOIN]: 'Telegram Join',
      [TASK_TYPES.INSTAGRAM_FOLLOW]: 'Instagram Follow',
      [TASK_TYPES.YOUTUBE_SUBSCRIBE]: 'YouTube Subscribe',
      [TASK_TYPES.WEBSITE_VISIT]: 'Website Visit'
    };
    return labelMap[type] || 'Task';
  };

  const handleSubmitCompletion = async () => {
    setSubmitting(true);
    try {
      // TODO: Submit completed tasks to backend
      // await SocialTaskService.submitTaskCompletion(raffleAddress, Array.from(completedTasks));
      
      // For now, just show success
      toast.success('Tasks submitted successfully!');
      if (onTasksCompleted) {
        onTasksCompleted(Array.from(completedTasks));
      }
    } catch (error) {
      console.error('Error submitting tasks:', error);
      toast.error('Error submitting tasks. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const requiredTasks = tasks.filter(task => task.required);
  const optionalTasks = tasks.filter(task => !task.required);
  const completedRequiredTasks = requiredTasks.filter(task => completedTasks.has(task.id));
  const allRequiredCompleted = requiredTasks.length > 0 && completedRequiredTasks.length === requiredTasks.length;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Social Media Tasks</CardTitle>
          <CardDescription>Loading tasks...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Social Media Tasks</CardTitle>
          <CardDescription>No social media tasks required for this raffle.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Social Media Tasks
        </CardTitle>
        <CardDescription>
          Complete the required social media tasks to participate in this raffle. 
          Tasks are verified automatically after you complete the actions.
        </CardDescription>
        {requiredTasks.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={allRequiredCompleted ? "default" : "secondary"}>
              {completedRequiredTasks.length}/{requiredTasks.length} Required Completed
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required Tasks */}
        {requiredTasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Required Tasks</h4>
            {requiredTasks.map((task) => {
              const isCompleted = completedTasks.has(task.id);
              const isVerifying = verifyingTasks.has(task.id);
              
              return (
                <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : isVerifying ? (
                      <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTaskIcon(task.type)}</span>
                      <span className="font-medium">{task.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {getTaskTypeLabel(task.type)}
                      </Badge>
                      {task.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {isVerifying && (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                          Verifying...
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTaskUrl(task)}
                        disabled={isCompleted || isVerifying}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {isCompleted ? 'Completed' : isVerifying ? 'Verifying...' : 'Complete Task'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Optional Tasks */}
        {optionalTasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Optional Tasks</h4>
            {optionalTasks.map((task) => {
              const isCompleted = completedTasks.has(task.id);
              const isVerifying = verifyingTasks.has(task.id);
              
              return (
                <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg opacity-75">
                  <div className="mt-1 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : isVerifying ? (
                      <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTaskIcon(task.type)}</span>
                      <span className="font-medium">{task.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {getTaskTypeLabel(task.type)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                      {isVerifying && (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                          Verifying...
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTaskUrl(task)}
                        disabled={isCompleted || isVerifying}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {isCompleted ? 'Completed' : isVerifying ? 'Verifying...' : 'Complete Task'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Button */}
        {requiredTasks.length > 0 && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleSubmitCompletion}
              disabled={!allRequiredCompleted || submitting}
              className="w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Task Completion'}
            </Button>
            {!allRequiredCompleted && requiredTasks.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Complete all required tasks to continue
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialTaskCompletion; 