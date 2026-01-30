
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job, User } from '../../types';
import { JobService } from '../../services/jobService';

interface JobsState {
  list: Job[];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

const initialState: JobsState = {
  list: [],
  loading: false,
  error: null,
  lastUpdated: 0
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.list = action.payload;
      state.lastUpdated = Date.now();
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
        state.error = action.payload;
        state.loading = false;
    },
    addJob: (state, action: PayloadAction<Job>) => {
      state.list.push(action.payload);
    },
    updateJobInStore: (state, action: PayloadAction<Job>) => {
      const index = state.list.findIndex(j => j.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteJobFromStore: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(j => j.id !== action.payload);
    }
  },
});

export const { setJobs, setLoading, setError, addJob, updateJobInStore, deleteJobFromStore } = jobsSlice.actions;

// Thunks
export const fetchJobs = (collegeId?: string) => async (dispatch: any) => {
    dispatch(setLoading(true));
    try {
        const jobs = await JobService.getJobs(collegeId);
        dispatch(setJobs(jobs));
    } catch (err: any) {
        dispatch(setError(err.message || 'Failed to fetch jobs'));
    }
};

export const createNewJob = (job: Job, user: User) => async (dispatch: any) => {
    dispatch(setLoading(true));
    try {
        const newJob = await JobService.createJob(job, user);
        dispatch(addJob(newJob));
        dispatch(setLoading(false));
    } catch (err: any) {
        dispatch(setError(err.message || 'Failed to create job'));
    }
};

export default jobsSlice.reducer;
