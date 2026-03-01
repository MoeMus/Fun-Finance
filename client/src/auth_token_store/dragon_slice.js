import { createSlice } from '@reduxjs/toolkit'

const storedDragon = sessionStorage.getItem('dragon');

const dragonSlice = createSlice({
  name: 'DragonSlice',
  initialState: {
    dragon: storedDragon ? JSON.parse(storedDragon) : null,
    is_dragon_loaded: !!storedDragon
  },
  reducers: {
    setDragon: (state, action) => {
      sessionStorage.setItem(
        'dragon',
        JSON.stringify(action.payload.dragon)
      );

      state.dragon = action.payload.dragon;
      state.is_dragon_loaded = true;
    },

    removeDragon: (state) => {
      sessionStorage.removeItem('dragon');
      state.dragon = null;
      state.is_dragon_loaded = false;
    }
  }
});

export const { setDragon, removeDragon } = dragonSlice.actions;
export default dragonSlice.reducer;