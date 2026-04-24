import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useLeadStore } from '../../store/leadStore';
import LeadCard from '../../components/leads/LeadCard';
import LeadForm from '../../components/leads/LeadForm';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function LeadsPage() {
  const { leads, fetchLeads, isLoading } = useLeadStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tempFilter, setTempFilter] = useState('');

  useEffect(() => {
    fetchLeads({ search, status: statusFilter, temperature: tempFilter });
  }, [search, statusFilter, tempFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {leads.length} total leads
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select value={tempFilter} onChange={(e) => setTempFilter(e.target.value)} className="input">
            <option value="">All Temperatures</option>
            <option value="HOT">🔥 Hot</option>
            <option value="WARM">⚠️ Warm</option>
            <option value="COLD">❄️ Cold</option>
          </select>
        </div>
      </div>

      {/* Leads grid */}
      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No leads found"
          description="Try adjusting your filters or create a new lead"
          action={
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Lead
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Lead"
        size="lg"
      >
        <LeadForm
          onSuccess={() => {
            setShowCreateModal(false);
            fetchLeads();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}
