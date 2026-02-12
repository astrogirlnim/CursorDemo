import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team } from '../types/team.types';
import { TeamService } from '../services/team.service';
import { useAuth } from './AuthContext';

/**
 * Team Context Type Definition
 * Provides team state and methods throughout the app
 */
interface TeamContextType {
  teams: Team[];
  currentTeam: Team | null;
  loading: boolean;
  error: string | null;
  selectTeam: (team: Team | null) => void;
  loadTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
}

/**
 * Team Context - manages team state globally
 */
const TeamContext = createContext<TeamContextType | undefined>(undefined);

/**
 * LocalStorage key for storing selected team ID
 */
const SELECTED_TEAM_KEY = 'selected_team_id';

/**
 * Team Provider Component
 * Wraps the app and provides team context
 */
export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  console.log('[TeamContext] State:', { 
    teamsCount: teams.length, 
    currentTeam: currentTeam?.name, 
    loading, 
    error 
  });

  /**
   * Load teams when user is authenticated
   */
  useEffect(() => {
    if (user) {
      console.log('[TeamContext] User authenticated, loading teams...');
      loadTeams();
    } else {
      console.log('[TeamContext] No user, clearing teams');
      setTeams([]);
      setCurrentTeam(null);
    }
  }, [user]);

  /**
   * Restore selected team from localStorage when teams are loaded
   * Clear current team if no teams available
   */
  useEffect(() => {
    if (teams.length > 0) {
      console.log('[TeamContext] Teams loaded, checking for stored team selection...');
      
      const storedTeamId = localStorage.getItem(SELECTED_TEAM_KEY);
      
      if (storedTeamId) {
        const teamId = parseInt(storedTeamId);
        const team = teams.find(t => t.id === teamId);
        
        if (team) {
          console.log('[TeamContext] Restoring selected team:', team.name);
          setCurrentTeam(team);
        } else {
          console.log('[TeamContext] Stored team not found, selecting first team');
          setCurrentTeam(teams[0]);
          localStorage.setItem(SELECTED_TEAM_KEY, teams[0].id.toString());
        }
      } else {
        // No stored selection, select first team by default
        console.log('[TeamContext] No stored selection, selecting first team');
        setCurrentTeam(teams[0]);
        localStorage.setItem(SELECTED_TEAM_KEY, teams[0].id.toString());
      }
    } else {
      // No teams available, clear current team and localStorage
      console.log('[TeamContext] No teams available, clearing current team selection');
      setCurrentTeam(null);
      localStorage.removeItem(SELECTED_TEAM_KEY);
    }
  }, [teams]);

  /**
   * Load teams from API
   */
  const loadTeams = async () => {
    console.log('[TeamContext] Loading teams...');
    setLoading(true);
    setError(null);

    try {
      const fetchedTeams = await TeamService.getTeams();
      console.log(`[TeamContext] Loaded ${fetchedTeams.length} teams`);
      setTeams(fetchedTeams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load teams';
      console.error('[TeamContext] Error loading teams:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Select a team as current
   * @param team - Team to select, or null to deselect
   */
  const selectTeam = (team: Team | null) => {
    console.log('[TeamContext] Selecting team:', team?.name || 'None');
    setCurrentTeam(team);
    
    if (team) {
      localStorage.setItem(SELECTED_TEAM_KEY, team.id.toString());
    } else {
      localStorage.removeItem(SELECTED_TEAM_KEY);
    }
  };

  /**
   * Create a new team
   * @param name - Team name
   */
  const createTeam = async (name: string) => {
    console.log('[TeamContext] Creating team:', name);
    setLoading(true);
    setError(null);

    try {
      const newTeam = await TeamService.createTeam(name);
      console.log('[TeamContext] Team created successfully:', newTeam.id);
      
      // Reload teams to get updated list
      await loadTeams();
      
      // Auto-select the newly created team
      setCurrentTeam(newTeam);
      localStorage.setItem(SELECTED_TEAM_KEY, newTeam.id.toString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      console.error('[TeamContext] Error creating team:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh teams (alias for loadTeams)
   */
  const refreshTeams = async () => {
    console.log('[TeamContext] Refreshing teams...');
    await loadTeams();
  };

  /**
   * Context value provided to consumers
   */
  const value: TeamContextType = {
    teams,
    currentTeam,
    loading,
    error,
    selectTeam,
    loadTeams,
    createTeam,
    refreshTeams,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

/**
 * useTeam Hook
 * Custom hook to access team context
 * @returns TeamContextType
 * @throws Error if used outside TeamProvider
 */
export function useTeam(): TeamContextType {
  const context = useContext(TeamContext);
  
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  
  return context;
}
