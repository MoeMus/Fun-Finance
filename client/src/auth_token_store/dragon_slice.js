import { createSlice } from "@reduxjs/toolkit";

function loadDragonFromSession() {
  const raw = sessionStorage.getItem("dragon");

  // nothing stored
  if (!raw) return null;

  // common bad values
  if (raw === "undefined" || raw === "null") return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    // corrupted / invalid JSON, wipe it
    sessionStorage.removeItem("dragon");
    return null;
  }
}

const storedDragonObj = loadDragonFromSession();

const dragonSlice = createSlice({
  name: "DragonSlice",
  initialState: {
    dragon: storedDragonObj,
    is_dragon_loaded: !!storedDragonObj,
  },
  reducers: {
    setDragon: (state, action) => {
      const dragon = action.payload?.dragon ?? null;

      if (dragon) {
        sessionStorage.setItem("dragon", JSON.stringify(dragon));
        state.dragon = dragon;
        state.is_dragon_loaded = true;
      } else {
        sessionStorage.removeItem("dragon");
        state.dragon = null;
        state.is_dragon_loaded = false;
      }
    },

    removeDragon: (state) => {
      sessionStorage.removeItem("dragon");
      state.dragon = null;
      state.is_dragon_loaded = false;
    },
  },
});

export const { setDragon, removeDragon } = dragonSlice.actions;
export default dragonSlice.reducer;