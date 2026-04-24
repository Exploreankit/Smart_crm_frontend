import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Download } from 'lucide-react';
import api from '../lib/api';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, DollarSign, TrendingUp, Target } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];
const TEMP_COLORS = { HOT: '#ef4444', WARM: '#f97316', COLD: '#3b82f6' };

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [
          api.get('/analytics/dashboard'),
          api.get('/analytics/trends', { params: { days: 30 } }),
        ];
        if (user?.role === 'ADMIN') {
          requests.push(api.get('/analytics/performance'));
        }
        const results = await Promise.all(requests);
        setDashboard(results[0].data);
        setTrends(results[1].data);
        if (results[2]) setPerformance(results[2].data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/export/leads/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) return <LoadingSpinner className="h-64" />;

  const { summary, pipeline, temperature } = dashboard || {};
  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Performance overview</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={summary?.totalLeads || 0} icon={Users} color="blue" />
        <StatCard title="Pipeline Value" value={formatCurrency(summary?.totalPipelineValue)} icon={DollarSign} color="green" />
        <StatCard title="Revenue Closed" value={formatCurrency(summary?.closedDealsValue)} icon={TrendingUp} color="purple" />
        <StatCard title="Conversion Rate" value={`${summary?.conversionRate || 0}%`} icon={Target} color="orange" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline bar chart */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Leads by Stage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pipeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  name === 'value' ? formatCurrency(value) : value,
                  name === 'value' ? 'Deal Value' : 'Count'
                ]}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature pie chart */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Lead Temperature</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={temperature}
                dataKey="count"
                nameKey="temperature"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ temperature: t, count }) => `${t}: ${count}`}
              >
                {temperature?.map((entry) => (
                  <Cell key={entry.temperature} fill={TEMP_COLORS[entry.temperature] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {temperature?.map((t) => (
              <div key={t.temperature} className="flex items-center gap-1.5 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: TEMP_COLORS[t.temperature] }} />
                <span className="text-gray-600 dark:text-gray-400">{t.temperature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends line chart */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Lead Activity (Last 30 Days)</h2>
        {trends.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No trend data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} name="New Leads" />
              <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} dot={false} name="Closed" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* User performance (Admin only) */}
      {user?.role === 'ADMIN' && performance.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Team Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Rep</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Leads</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Closed</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Conv. Rate</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Revenue</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {performance.map(({ user: u, metrics }) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{metrics.totalLeads}</td>
                    <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{metrics.closedLeads}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-medium ${metrics.conversionRate >= 30 ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {metrics.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(metrics.closedValue)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${metrics.avgLeadScore}%` }} />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{metrics.avgLeadScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
