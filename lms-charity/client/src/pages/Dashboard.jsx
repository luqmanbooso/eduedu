import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, BarChart3, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'student' && "Continue your learning journey"}
          {user.role === 'instructor' && "Manage your courses and students"}
          {user.role === 'admin' && "Oversee platform operations"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="My Courses"
          value="12"
          icon={<BookOpen className="h-6 w-6" />}
          color="bg-blue-500"
        />
        <DashboardCard
          title="Students"
          value="156"
          icon={<Users className="h-6 w-6" />}
          color="bg-green-500"
        />
        <DashboardCard
          title="Completion Rate"
          value="89%"
          icon={<BarChart3 className="h-6 w-6" />}
          color="bg-purple-500"
        />
        <DashboardCard
          title="Hours Learned"
          value="24"
          icon={<Settings className="h-6 w-6" />}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem 
              title="Completed: Introduction to React"
              time="2 hours ago"
            />
            <ActivityItem 
              title="Started: Advanced JavaScript"
              time="1 day ago"
            />
            <ActivityItem 
              title="Quiz passed: HTML Fundamentals"
              time="3 days ago"
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickActionButton title="Browse New Courses" />
            <QuickActionButton title="Continue Learning" />
            <QuickActionButton title="View Progress" />
            {user.role === 'instructor' && (
              <QuickActionButton title="Create New Course" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, color }) => (
  <div className="card">
    <div className="flex items-center">
      <div className={`${color} text-white p-3 rounded-lg`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ title, time }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-900">{title}</span>
    <span className="text-sm text-gray-500">{time}</span>
  </div>
);

const QuickActionButton = ({ title }) => (
  <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
    {title}
  </button>
);

export default Dashboard;
