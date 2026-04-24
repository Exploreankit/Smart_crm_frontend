import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, DollarSign, TrendingUp, CheckSquare,
  AlertCircle, Activity, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useTaskStore } from '../store/taskStore';

const activityIcons = {
  LEAD_CREATED: '🆕',
  STATUS_CHANGE: '🔄',
  NOTE: '📝',
  CALL: '📞',
  MEETING: '🤝',
  EMAIL: '📧',
  TASK_CREATED: '✅',
  TASK_COMPLETED: '🎉',
  LEAD_ASSIGNED: '👤',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { upcomingTasks, fetchUpcomingTasks } = useTaskStore();

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: dashData }] = await Promise.all([
          api.get('/analytics/dashboard'),
          fetchUpcomingTasks(),
        ]);
        setStats(dashData);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return <LoadingSpinner className="h-64" />;
  }

  const { summary, pipeline, recentActivities } = stats || {};

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={summary?.totalLeads || 0}
          icon={Users}
          color="blue"
          subtitle="All pipeline leads"
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(summary?.totalPipelineValue)}
          icon={DollarSign}
          color="green"
          subtitle="Total deal value"
        />
        <StatCard
          title="Conversion Rate"
          value={`${summary?.conversionRate || 0}%`}
          icon={TrendingUp}
          color="purple"
          subtitle={`${summary?.closedDealsCount || 0} deals closed`}
        />
        <StatCard
          title="Pending Tasks"
          value={summary?.pendingTasks || 0}
          icon={CheckSquare}
          color={summary?.overdueTasks > 0 ? 'red' : 'orange'}
          subtitle={summary?.overdueTasks > 0 ? `${summary.overdueTasks} overdue` : 'All on track'}
        />
      </div>

      {/* Pipeline overview + Upcoming tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline stages */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Pipeline Overview</h2>
            <Link to="/pipeline" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View board <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {pipeline?.map(({ stage, count, value }) => {
              const maxCount = Math.max(...(pipeline?.map((p) => p.count) || [1]), 1);
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <Badge value={stage} />
                      <span className="text-gray-500 dark:text-gray-400">{count} leads</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(value)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No upcoming tasks</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    task.priority === 'HIGH' ? 'bg-red-500' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{task.lead?.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Due {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Recent Activity
          </h2>
        </div>
        {recentActivities?.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{activityIcons[activity.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{activity.user?.name}</span>
                    {' — '}
                    {activity.description}
                  </p>
                  {activity.lead && (
                    <Link
                      to={`/leads/${activity.lead.id}`}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      {activity.lead.name} {activity.lead.company && `· ${activity.lead.company}`}
                    </Link>
                  )}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
