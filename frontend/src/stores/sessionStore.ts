/**
 * frontend/src/stores/sessionStore.ts
 * --------------------------------------
 * Lightweight Zustand store for client-side session state.
 * Authoritative state lives in the backend DB.
 * This store holds only UI state needed for the current session.
 */

import { create } from "zustand";

interface SignalChip {
  id: string;
  label: string;
  category: string;
  source: string;
}

interface ChangeAnnotation {
  creator_id: string;
  channel_name: string;
  previous_rank: number;
  new_rank: number;
  explanation: string;
}

interface SessionState {
  /** Current campaign brief ID */
  briefId: string | null;

  /** The marketer-confirmed signal set — used by LoadingSequence to generate status messages */
  confirmedSignals: SignalChip[];

  /** Current shortlist version number */
  shortlistVersion: number;

  /** Most recent scoring diff — used by ChangeAnnotation components */
  scoringDiff: ChangeAnnotation[];

  /** Whether the approved shortlist is immutably locked */
  shortlistLocked: boolean;

  // Actions
  setBriefId: (id: string) => void;
  setConfirmedSignals: (signals: SignalChip[]) => void;
  incrementShortlistVersion: () => void;
  setScoringDiff: (diff: ChangeAnnotation[]) => void;
  lockShortlist: () => void;
  reset: () => void;
}

const initialState = {
  briefId: null,
  confirmedSignals: [],
  shortlistVersion: 0,
  scoringDiff: [],
  shortlistLocked: false,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setBriefId: (id) => set({ briefId: id }),

  setConfirmedSignals: (signals) => set({ confirmedSignals: signals }),

  incrementShortlistVersion: () =>
    set((state) => ({ shortlistVersion: state.shortlistVersion + 1 })),

  setScoringDiff: (diff) => set({ scoringDiff: diff }),

  lockShortlist: () => set({ shortlistLocked: true }),

  reset: () => set(initialState),
}));
