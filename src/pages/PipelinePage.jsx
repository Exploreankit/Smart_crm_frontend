import { useEffect, useState } from 'react';
import { Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLeadStore } from '../store/leadStore';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LeadForm from '../components/leads/LeadForm';
import { useNavigate } from 'react-router-dom';

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'];

const stageColors = {
  NEW: 'border-t-blue-500',
  CONTACTED: 'border-t-yellow-500',
  QUALIFIED: 'border-t-purple-500',
  CLOSED: 'border-t-green-500',
};

// Draggable lead card for Kanban
function KanbanCard({ lead }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0" onClick={() => navigate(`/leads/${lead.id}`)}>
          <div className="flex items-start justify-between gap-1 mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {lead.name}
            </p>
            <Badge value={lead.temperature} showIcon />
          </div>
          {lead.company && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{lead.company}</p>
          )}

          {/* Score bar */}
          <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${
                lead.score >= 70 ? 'bg-red-500' : lead.score >= 40 ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              style={{ width: `${lead.score}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              {formatCurrency(lead.dealValue)}
            </span>
            {lead.assignedTo && (
              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold" title={lead.assignedTo.name}>
                {lead.assignedTo.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Droppable column
function KanbanColumn({ stage, leads, onAddLead }) {
  const { setNodeRef } = useSortable({ id: stage });

  const totalValue = leads.reduce((sum, l) => sum + l.dealValue, 0);
  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div className={`flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl border-t-4 ${stageColors[stage]} border border-gray-200 dark:border-gray-800 min-h-[500px]`}>
      {/* Column header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Badge value={stage} />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {leads.length}
            </span>
          </div>
          <button
            onClick={onAddLead}
            className="p-1 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(totalValue)}</p>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 p-3 space-y-2 overflow-y-auto">
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { pipeline, fetchPipeline, updateLeadStatus } = useLeadStore();
  const [activeId, setActiveId] = useState(null);
  const [activeLead, setActiveLead] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('NEW');

  useEffect(() => {
    fetchPipeline();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    // Find the lead across all stages
    for (const stage of STAGES) {
      const lead = pipeline[stage]?.find((l) => l.id === active.id);
      if (lead) { setActiveLead(lead); break; }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveLead(null);

    if (!over) return;

    // Determine target stage
    let targetStage = null;
    if (STAGES.includes(over.id)) {
      targetStage = over.id;
    } else {
      // over.id is a lead id — find which stage it belongs to
      for (const stage of STAGES) {
        if (pipeline[stage]?.find((l) => l.id === over.id)) {
          targetStage = stage;
          break;
        }
      }
    }

    if (!targetStage) return;

    // Find current stage of dragged lead
    let currentStage = null;
    for (const stage of STAGES) {
      if (pipeline[stage]?.find((l) => l.id === active.id)) {
        currentStage = stage;
        break;
      }
    }

    if (currentStage !== targetStage) {
      await updateLeadStatus(active.id, targetStage);
    }
  };

  const handleAddLead = (status) => {
    setDefaultStatus(status);
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag leads between stages</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={pipeline[stage] || []}
              onAddLead={() => handleAddLead(stage)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-primary-300 dark:border-primary-700 p-3 shadow-xl rotate-2 opacity-90">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeLead.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activeLead.company}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Lead to Pipeline"
        size="lg"
      >
        <LeadForm
          lead={{ status: defaultStatus }}
          onSuccess={() => { setShowCreateModal(false); fetchPipeline(); }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}
