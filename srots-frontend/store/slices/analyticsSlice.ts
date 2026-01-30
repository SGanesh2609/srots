
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  totalStudents: number;
  placedStudents: number;
  activeJobs: number;
  participatingCompanies: number;
}

const initialState: AnalyticsState = {
  totalStudents: 0,
  placedStudents: 0,
  activeJobs: 0,
  participatingCompanies: 0
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    updateMetrics: (state, action: PayloadAction<AnalyticsState>) => {
      return { ...state, ...action.payload };
    }
  },
});

export const { updateMetrics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
