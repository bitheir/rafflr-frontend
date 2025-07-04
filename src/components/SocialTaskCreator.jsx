import React, { useState } from 'react';
import { Plus, Trash2, Twitter, MessageCircle, Instagram, Youtube, Globe, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { TASK_TYPES } from '../lib/supabase';

const SocialTaskCreator = ({ onTasksChange, initialTasks = [], onSubmit, visible = false }) => {
  const [tasks, setTasks] = useState(initialTasks);

  const taskTypeOptions = [
    { value: TASK_TYPES.TWITTER_FOLLOW, label: 'Follow Twitter Account', icon: Twitter },
    { value: TASK_TYPES.TWITTER_RETWEET, label: 'Retweet Post', icon: Twitter },
    { value: TASK_TYPES.TWITTER_LIKE, label: 'Like Tweet', icon: Twitter },
    { value: TASK_TYPES.DISCORD_JOIN, label: 'Join Discord Server', icon: MessageCircle },
    { value: TASK_TYPES.TELEGRAM_JOIN, label: 'Join Telegram Group', icon: MessageCircle },
    { value: TASK_TYPES.INSTAGRAM_FOLLOW, label: 'Follow Instagram Account', icon: Instagram },
    { value: TASK_TYPES.YOUTUBE_SUBSCRIBE, label: 'Subscribe to YouTube Channel', icon: Youtube },
    { value: TASK_TYPES.WEBSITE_VISIT, label: 'Visit Website', icon: Globe }
  ];

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      type: TASK_TYPES.TWITTER_FOLLOW,
      title: '',
      description: '',
      url: '',
      required: true
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
  };

  const removeTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
  };

  const updateTask = (taskId, field, value) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, [field]: value } : task
    );
    setTasks(updatedTasks);
    onTasksChange(updatedTasks);
  };

  const getTaskIcon = (type) => {
    const option = taskTypeOptions.find(opt => opt.value === type);
    return option ? React.createElement(option.icon, { className: "h-4 w-4" }) : <Globe className="h-4 w-4" />;
  };

  if (!visible) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Media Tasks
        </CardTitle>
        <CardDescription>
          Add social media tasks that participants must complete before purchasing tickets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="border-dashed">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getTaskIcon(task.type)}
                    <span className="font-medium">Task {tasks.indexOf(task) + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`task-type-${task.id}`}>Task Type</Label>
                    <Select
                      value={task.type}
                      onValueChange={(value) => updateTask(task.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {React.createElement(option.icon, { className: "h-4 w-4" })}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`task-title-${task.id}`}>Task Title</Label>
                    <Input
                      id={`task-title-${task.id}`}
                      placeholder="e.g., Follow our Twitter"
                      value={task.title}
                      onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`task-description-${task.id}`}>Description</Label>
                    <Input
                      id={`task-description-${task.id}`}
                      placeholder="Detailed description of what participants need to do"
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`task-url-${task.id}`}>URL/Link</Label>
                    <Input
                      id={`task-url-${task.id}`}
                      placeholder="https://twitter.com/username or Discord invite link"
                      value={task.url}
                      onChange={(e) => updateTask(task.id, 'url', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Switch
                      id={`task-required-${task.id}`}
                      checked={task.required}
                      onCheckedChange={(checked) => updateTask(task.id, 'required', checked)}
                    />
                    <Label htmlFor={`task-required-${task.id}`}>Required task</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addTask}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Social Media Task
          </Button>

          {/* Submit all tasks button */}
          {tasks.length > 0 && typeof onSubmit === 'function' && (
            <Button
              type="button"
              variant="default"
              onClick={() => onSubmit(tasks)}
              className="w-full mt-2"
            >
              Submit Social Tasks
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialTaskCreator; 