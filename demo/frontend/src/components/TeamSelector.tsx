import { useState } from 'react';
import { useTeam } from '../contexts/TeamContext';

/**
 * TeamSelector Component
 * Dropdown to select current team and create new teams
 */
export function TeamSelector() {
  const { teams, currentTeam, selectTeam, createTeam, loading, error } = useTeam();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  console.log('[TeamSelector] Rendering:', { 
    teamsCount: teams.length, 
    currentTeam: currentTeam?.name,
    loading 
  });

  /**
   * Handle team selection change
   */
  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    
    // Handle special "unassigned" value
    if (value === 'unassigned') {
      console.log('[TeamSelector] Unassigned tasks selected');
      selectTeam({ id: -1, name: 'Unassigned Tasks' } as any);
      return;
    }
    
    const teamId = parseInt(value);
    const team = teams.find(t => t.id === teamId);
    
    console.log('[TeamSelector] Team selected:', team?.name);
    selectTeam(team || null);
  };

  /**
   * Handle create team form submission
   */
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeamName.trim()) {
      setCreateError('Team name is required');
      return;
    }

    console.log('[TeamSelector] Creating team:', newTeamName);
    setCreating(true);
    setCreateError(null);

    try {
      await createTeam(newTeamName.trim());
      console.log('[TeamSelector] Team created successfully');
      
      // Reset form
      setNewTeamName('');
      setShowCreateForm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      console.error('[TeamSelector] Create team error:', errorMessage);
      setCreateError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-2">
            Current Team
          </label>
          
          {loading && teams.length === 0 ? (
            <div className="text-sm text-gray-500">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="text-sm text-gray-500">No teams available. Create one to get started!</div>
          ) : (
            <select
              id="team-select"
              value={currentTeam?.id === -1 ? 'unassigned' : (currentTeam?.id || '')}
              onChange={handleTeamChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Select a team...</option>
              <option value="unassigned" className="text-gray-600 italic">
                📋 Unassigned Tasks
              </option>
              <option disabled>─────────────</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="ml-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          >
            {showCreateForm ? 'Cancel' : 'New Team'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateTeam} className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="mb-4">
            <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-2">
              Team Name
            </label>
            <input
              id="team-name"
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={creating}
              autoFocus
            />
            {createError && (
              <div className="mt-2 text-sm text-red-600">
                {createError}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Team'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTeamName('');
                setCreateError(null);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={creating}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
