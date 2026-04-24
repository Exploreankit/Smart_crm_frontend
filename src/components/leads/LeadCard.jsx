import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, DollarSign } from 'lucide-react';
import Badge from '../ui/Badge';

export default function LeadCard({ lead, compact = false }) {
  const navigate = useNavigate();

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div
      onClick={() => navigate(`/leads/${lead.id}`)}
      className="card p-4 cursor-pointer hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {lead.name}
          </h3>
          {lead.company && (
            <div className="flex items-center gap-1 mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              <Building2 className="w-3.5 h-3.5" />
              {lead.company}
            </div>
          )}
        </div>
        <Badge value={lead.temperature} showIcon />
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Lead Score</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{lead.score}/100</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              lead.score >= 70 ? 'bg-red-500' : lead.score >= 40 ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            style={{ width: `${lead.score}%` }}
          />
        </div>
      </div>

      {!compact && (
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              {lead.phone}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Badge value={lead.status} />
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
          <DollarSign className="w-3.5 h-3.5 text-green-500" />
          {formatCurrency(lead.dealValue)}
        </div>
      </div>

      {/* Assigned to */}
      {lead.assignedTo && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {lead.assignedTo.name.charAt(0)}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{lead.assignedTo.name}</span>
        </div>
      )}
    </div>
  );
}
