import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Agent } from '../../types/agent';
import AgentList from './AgentList';
import AgentForm from './AgentForm';
import AgentProfile from './AgentProfile';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const validAgents = data || [];
      validAgents.forEach(agent => {
        if (agent.contract_end_date) {
          const daysUntilEnd = differenceInDays(
            new Date(agent.contract_end_date),
            new Date()
          );
          if (daysUntilEnd <= 30 && daysUntilEnd > 0) {
            toast.error(`Contract ending soon for ${agent.name} (${daysUntilEnd} days remaining)`);
          }
        }
      });

      setAgents(validAgents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (agentData: Partial<Agent>, photo: File | null) => {
    try {
      setLoading(true);
      
      let photo_url = null;
      if (photo) {
        const { data: photoData, error: photoError } = await supabase.storage
          .from('agent-photos')
          .upload(`${Date.now()}-${photo.name}`, photo);
        
        if (photoError) throw photoError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('agent-photos')
          .getPublicUrl(photoData.path);
          
        photo_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('agents')
        .insert([{
          ...agentData,
          photo_url
        }])
        .select()
        .single();

      if (error) throw error;

      setAgents(prevAgents => [...prevAgents, data]);
      setShowForm(false);
      toast.success('Agent added successfully');
      
      fetchAgents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add agent';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgent = async (agentData: Partial<Agent>, photo: File | null) => {
    if (!selectedAgent) return;

    try {
      setLoading(true);
      
      let photo_url = selectedAgent.photo_url;
      if (photo) {
        if (selectedAgent.photo_url) {
          const oldPhotoPath = selectedAgent.photo_url.split('/').pop();
          if (oldPhotoPath) {
            await supabase.storage
              .from('agent-photos')
              .remove([oldPhotoPath]);
          }
        }

        const { data: photoData, error: photoError } = await supabase.storage
          .from('agent-photos')
          .upload(`${Date.now()}-${photo.name}`, photo);
        
        if (photoError) throw photoError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('agent-photos')
          .getPublicUrl(photoData.path);
          
        photo_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('agents')
        .update({
          ...agentData,
          photo_url
        })
        .eq('id', selectedAgent.id)
        .select()
        .single();

      if (error) throw error;

      setAgents(prevAgents => 
        prevAgents.map(agent => agent.id === selectedAgent.id ? data : agent)
      );
      setSelectedAgent(null);
      setShowForm(false);
      toast.success('Agent updated successfully');
      
      fetchAgents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      setLoading(true);
      
      const agent = agents.find(a => a.id === id);
      
      if (agent?.photo_url) {
        const photoPath = agent.photo_url.split('/').pop();
        if (photoPath) {
          await supabase.storage
            .from('agent-photos')
            .remove([photoPath]);
        }
      }

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgents(prevAgents => prevAgents.filter(agent => agent.id !== id));
      toast.success('Agent deleted successfully');
      
      fetchAgents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !agents.length) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && !agents.length) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agents Management</h1>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => {
              setSelectedAgent(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Add Agent
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <AgentForm
            onSubmit={selectedAgent ? handleEditAgent : handleAddAgent}
            onCancel={() => {
              setShowForm(false);
              setSelectedAgent(null);
            }}
            initialData={selectedAgent || undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <AgentList
            agents={agents}
            onEdit={(agent) => {
              setSelectedAgent(agent);
              setShowForm(true);
            }}
            onDelete={handleDeleteAgent}
            onView={(agent) => setViewingAgent(agent)}
          />
        </div>
      )}

      {viewingAgent && (
        <AgentProfile
          agent={viewingAgent}
          onClose={() => setViewingAgent(null)}
        />
      )}
    </div>
  );
}