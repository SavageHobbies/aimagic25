import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserSettings {
  theme: 'light' | 'dark';
  defaultCondition: string;
  defaultShippingService: string;
  notificationsEnabled: boolean;
  autoSaveDrafts: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  preferredCategories: string[];
  subscriptionTier: 'free' | 'premium' | 'enterprise';
}

const initialState: UserSettings = {
  theme: 'light',
  defaultCondition: 'New',
  defaultShippingService: 'Standard',
  notificationsEnabled: true,
  autoSaveDrafts: true,
  imageQuality: 'high',
  preferredCategories: [],
  subscriptionTier: 'free',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      return { ...state, ...action.payload };
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setDefaultCondition: (state, action: PayloadAction<string>) => {
      state.defaultCondition = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    updateSubscriptionTier: (state, action: PayloadAction<'free' | 'premium' | 'enterprise'>) => {
      state.subscriptionTier = action.payload;
    },
  },
});

export const {
  updateSettings,
  setTheme,
  setDefaultCondition,
  toggleNotifications,
  updateSubscriptionTier,
} = settingsSlice.actions;

export default settingsSlice.reducer;
