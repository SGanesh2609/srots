
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudentProfile } from '../../types';

interface StudentState {
  profile: StudentProfile | null;
  loading: boolean;
}

const initialState: StudentState = {
  profile: null,
  loading: false
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<StudentProfile>) => {
      state.profile = action.payload;
    },
    updateProfilePart: (state, action: PayloadAction<Partial<StudentProfile>>) => {
        if (state.profile) {
            state.profile = { ...state.profile, ...action.payload };
        }
    }
  },
});

export const { setProfile, updateProfilePart } = studentSlice.actions;
export default studentSlice.reducer;
