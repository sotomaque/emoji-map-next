import type { MerchantPlaceSearchResult } from '@/types/admin-search';

type LoadingStep = {
  message: string;
  status: 'pending' | 'complete' | 'error';
};

type DialogState = 'closed' | 'claim' | 'loading' | 'list' | 'verify';

export interface DashboardState {
  dialogState: DialogState;
  loadingSteps: LoadingStep[];
  isSubmitting: boolean;
  searchResults: MerchantPlaceSearchResult[];
  selectedPlace: MerchantPlaceSearchResult | null;
}

export type DashboardAction =
  | { type: 'OPEN_CLAIM_DIALOG' }
  | { type: 'START_LOADING' }
  | {
      type: 'UPDATE_LOADING_STEP';
      payload: { index: number; status: LoadingStep['status'] };
    }
  | {
      type: 'SHOW_LIST';
      payload: { searchResults: MerchantPlaceSearchResult[] };
    }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'HANDLE_ERROR'; payload: { stepIndex: number } }
  | { type: 'SELECT_PLACE'; payload: MerchantPlaceSearchResult };

export const initialState: DashboardState = {
  dialogState: 'closed',
  loadingSteps: [{ message: 'Finding your business', status: 'pending' }],
  isSubmitting: false,
  searchResults: [],
  selectedPlace: null,
};

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case 'OPEN_CLAIM_DIALOG':
      return {
        ...state,
        dialogState: 'claim',
        loadingSteps: initialState.loadingSteps,
        searchResults: [],
        selectedPlace: null,
      };
    case 'START_LOADING':
      return {
        ...state,
        dialogState: 'loading',
        loadingSteps: initialState.loadingSteps,
      };
    case 'SHOW_LIST':
      return {
        ...state,
        dialogState: 'list',
        searchResults: action.payload.searchResults,
      };
    case 'SELECT_PLACE':
      return {
        ...state,
        dialogState: 'verify',
        selectedPlace: action.payload,
      };
    case 'UPDATE_LOADING_STEP':
      return {
        ...state,
        loadingSteps: state.loadingSteps.map((step, i) =>
          i === action.payload.index
            ? { ...step, status: action.payload.status }
            : step
        ),
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialogState: 'closed',
        loadingSteps: initialState.loadingSteps,
        searchResults: [],
        selectedPlace: null,
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case 'HANDLE_ERROR':
      return {
        ...state,
        loadingSteps: state.loadingSteps.map((step, i) =>
          i === action.payload.stepIndex ? { ...step, status: 'error' } : step
        ),
      };
    default:
      return state;
  }
}
