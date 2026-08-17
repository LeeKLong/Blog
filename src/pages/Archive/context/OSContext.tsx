import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Project } from '../../../utils/projects';

export interface WindowState {
  id: string;
  project?: Project;
  isAbout?: boolean;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  zIndex: number;
  snap?: 'left' | 'right' | 'top' | null;
  spawnIndex?: number;
}

interface OSState {
  windows: Record<string, WindowState>;
  focusedWindowId: string | null;
  startMenuOpen: boolean;
  isBooting: boolean;
  isMobileMode: boolean;
  toastStack: Array<{ id: string; msg: string; icon: string }>;
  topZIndex: number;
  savedWindowStates: string[]; // Store IDs of windows that were open before showing desktop
  spawnCount: number;
}

type OSAction =
  | { type: 'OPEN_WINDOW'; payload: { id: string; project?: Project; isAbout?: boolean } }
  | { type: 'CLOSE_WINDOW'; payload: string }
  | { type: 'FOCUS_WINDOW'; payload: string }
  | { type: 'MINIMIZE_WINDOW'; payload: string }
  | { type: 'RESTORE_WINDOW'; payload: string }
  | { type: 'TOGGLE_MAXIMIZE'; payload: string }
  | { type: 'SET_SNAP'; payload: { id: string; snap: 'left' | 'right' | 'top' | null } }
  | { type: 'TOGGLE_START_MENU' }
  | { type: 'CLOSE_START_MENU' }
  | { type: 'SET_BOOTING'; payload: boolean }
  | { type: 'SET_MOBILE_MODE'; payload: boolean }
  | { type: 'ADD_TOAST'; payload: { id: string; msg: string; icon: string } }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLOSE_ALL_WINDOWS' }
  | { type: 'MINIMIZE_ALL_WINDOWS' }
  | { type: 'RESTORE_ALL_WINDOWS' }
  | { type: 'TOGGLE_SHOW_DESKTOP' };

const initialState: OSState = {
  windows: {},
  focusedWindowId: null,
  startMenuOpen: false,
  isBooting: true,
  isMobileMode: false,
  toastStack: [],
  topZIndex: 100,
  savedWindowStates: [],
  spawnCount: 0,
};

function osReducer(state: OSState, action: OSAction): OSState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const { id, project, isAbout } = action.payload;
      if (state.windows[id]) {
        return osReducer(
          osReducer(state, { type: 'RESTORE_WINDOW', payload: id }),
          { type: 'FOCUS_WINDOW', payload: id }
        );
      }
      const newZ = state.topZIndex + 1;
      const newSpawnCount = state.spawnCount + 1;
      return {
        ...state,
        windows: {
          ...state.windows,
          [id]: {
            id,
            project,
            isAbout,
            minimized: false,
            maximized: false,
            focused: true,
            zIndex: newZ,
            spawnIndex: newSpawnCount,
          },
        },
        focusedWindowId: id,
        topZIndex: newZ,
        startMenuOpen: false,
        spawnCount: newSpawnCount,
      };
    }
    case 'CLOSE_WINDOW': {
      const newWindows = { ...state.windows };
      delete newWindows[action.payload];
      return {
        ...state,
        windows: newWindows,
        focusedWindowId: state.focusedWindowId === action.payload ? null : state.focusedWindowId,
      };
    }
    case 'FOCUS_WINDOW': {
      const win = state.windows[action.payload];
      if (!win) return state;
      if (win.minimized) return state;
      const newZ = state.topZIndex + 1;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload]: { ...win, focused: true, zIndex: newZ },
        },
        focusedWindowId: action.payload,
        topZIndex: newZ,
        startMenuOpen: false,
      };
    }
    case 'MINIMIZE_WINDOW': {
      const win = state.windows[action.payload];
      if (!win) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload]: { ...win, minimized: true, focused: false },
        },
        focusedWindowId: state.focusedWindowId === action.payload ? null : state.focusedWindowId,
      };
    }
    case 'RESTORE_WINDOW': {
      const win = state.windows[action.payload];
      if (!win) return state;
      return osReducer(
        {
          ...state,
          windows: {
            ...state.windows,
            [action.payload]: { ...win, minimized: false },
          },
        },
        { type: 'FOCUS_WINDOW', payload: action.payload }
      );
    }
    case 'TOGGLE_MAXIMIZE': {
      const win = state.windows[action.payload];
      if (!win) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload]: { ...win, maximized: !win.maximized },
        },
      };
    }
    case 'SET_SNAP': {
      const win = state.windows[action.payload.id];
      if (!win) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: { ...win, snap: action.payload.snap },
        },
      };
    }
    case 'TOGGLE_START_MENU':
      return { ...state, startMenuOpen: !state.startMenuOpen };
    case 'CLOSE_START_MENU':
      return { ...state, startMenuOpen: false };
    case 'SET_BOOTING':
      return { ...state, isBooting: action.payload };
    case 'SET_MOBILE_MODE':
      return { ...state, isMobileMode: action.payload };
    case 'ADD_TOAST':
      return { ...state, toastStack: [...state.toastStack, action.payload] };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toastStack: state.toastStack.filter((t) => t.id !== action.payload),
      };
    case 'CLOSE_ALL_WINDOWS':
      return { ...state, windows: {}, focusedWindowId: null, savedWindowStates: [] };
    case 'MINIMIZE_ALL_WINDOWS': {
      const saved = Object.keys(state.windows).filter(id => !state.windows[id].minimized);
      if (saved.length === 0) return state;
      const newWindows = { ...state.windows };
      saved.forEach(id => {
        newWindows[id] = { ...newWindows[id], minimized: true, focused: false };
      });
      return { ...state, windows: newWindows, focusedWindowId: null, savedWindowStates: saved };
    }
    case 'RESTORE_ALL_WINDOWS': {
      if (state.savedWindowStates.length === 0) return state;
      const newWindows = { ...state.windows };
      let newZ = state.topZIndex;
      state.savedWindowStates.forEach(id => {
        if (newWindows[id]) {
          newZ++;
          newWindows[id] = { ...newWindows[id], minimized: false, zIndex: newZ };
        }
      });
      return { 
        ...state, 
        windows: newWindows, 
        topZIndex: newZ, 
        focusedWindowId: state.savedWindowStates[state.savedWindowStates.length - 1],
        savedWindowStates: []
      };
    }
    case 'TOGGLE_SHOW_DESKTOP': {
      const anyVisible = Object.values(state.windows).some(win => !win.minimized);
      if (anyVisible) {
        return osReducer(state, { type: 'MINIMIZE_ALL_WINDOWS' });
      } else {
        return osReducer(state, { type: 'RESTORE_ALL_WINDOWS' });
      }
    }
    default:
      return state;
  }
}

const OSContext = createContext<{
  state: OSState;
  dispatch: React.Dispatch<OSAction>;
} | null>(null);

export function OSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(osReducer, initialState);
  return (
    <OSContext.Provider value={{ state, dispatch }}>
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
}
