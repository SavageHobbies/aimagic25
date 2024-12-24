import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DraftProduct {
  id: string;
  title: string;
  description: string;
  condition: string;
  price: number;
  images: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'publishing' | 'published' | 'failed';
}

interface DraftState {
  drafts: DraftProduct[];
  selectedDraft: DraftProduct | null;
  loading: boolean;
  error: string | null;
}

const initialState: DraftState = {
  drafts: [],
  selectedDraft: null,
  loading: false,
  error: null,
};

const draftSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    setDrafts: (state, action: PayloadAction<DraftProduct[]>) => {
      state.drafts = action.payload;
    },
    addDraft: (state, action: PayloadAction<DraftProduct>) => {
      state.drafts.unshift(action.payload);
    },
    updateDraft: (state, action: PayloadAction<DraftProduct>) => {
      const index = state.drafts.findIndex(draft => draft.id === action.payload.id);
      if (index !== -1) {
        state.drafts[index] = action.payload;
      }
    },
    deleteDraft: (state, action: PayloadAction<string>) => {
      state.drafts = state.drafts.filter(draft => draft.id !== action.payload);
    },
    setSelectedDraft: (state, action: PayloadAction<DraftProduct | null>) => {
      state.selectedDraft = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setDrafts,
  addDraft,
  updateDraft,
  deleteDraft,
  setSelectedDraft,
  setLoading,
  setError,
} = draftSlice.actions;

export default draftSlice.reducer;
