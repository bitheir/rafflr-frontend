import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SocialTaskCreator from './SocialTaskCreator';
import SocialTaskCompletion from './SocialTaskCompletion';

const TestSocialFeatures = () => {
  const [socialTasks, setSocialTasks] = useState([]);
  const [showSocialTasks, setShowSocialTasks] = useState(true);

  const handleSocialTasksChange = (tasks) => {
    setSocialTasks(tasks);
  };

  const handleTasksCompleted = (completedTaskIds) => {
    console.log('Tasks completed:', completedTaskIds);
    alert(`Completed ${completedTaskIds.length} tasks!`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Social Media Features Test</h1>
        <p className="text-muted-foreground">
          Test the social media task creation and completion features
        </p>
      </div>

      <Tabs defaultValue="creator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="creator">Task Creator (Admin)</TabsTrigger>
          <TabsTrigger value="completion">Task Completion (User)</TabsTrigger>
        </TabsList>

        <TabsContent value="creator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Creator Dashboard</CardTitle>
              <CardDescription>
                Create social media tasks for your raffle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-6">
                <input
                  type="checkbox"
                  id="enable-tasks"
                  checked={showSocialTasks}
                  onChange={(e) => setShowSocialTasks(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="enable-tasks" className="text-base font-medium">
                  Enable social media tasks for this raffle
                </label>
              </div>

              {showSocialTasks && (
                <SocialTaskCreator
                  onTasksChange={handleSocialTasksChange}
                  initialTasks={socialTasks}
                  visible={showSocialTasks}
                  onSubmit={(tasks) => {
                    console.log('Tasks to save:', tasks);
                    alert(`Saving ${tasks.length} tasks to database...`);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participant View</CardTitle>
              <CardDescription>
                Complete social media tasks to participate in the raffle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialTaskCompletion
                raffleAddress="0x1234567890123456789012345678901234567890"
                onTasksCompleted={handleTasksCompleted}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Current State:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify({ socialTasks, showSocialTasks }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestSocialFeatures; 