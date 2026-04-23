import { create } from 'zustand';

const defaultForm = {
  hcp_name: '',
  date: '',
  specialty: '',
  location: '',
  sentiment: '',
  brochure_shared: false,
  samples_provided: false,
  follow_up_required: false,
  products_discussed: [],
  notes: '',
  status: '',
};

export const useStore = create((set) => ({
  form: { ...defaultForm },
  updatedFields: new Set(),
  chatHistory: [],
  messages: [],
  isLoading: false,
  toolActive: null,
  validationResult: null,
  summaryText: null,

  updateForm: (updates) =>
    set((state) => {
      const changed = new Set();
      Object.keys(updates).forEach((k) => {
        if (JSON.stringify(state.form[k]) !== JSON.stringify(updates[k])) {
          changed.add(k);
        }
      });
      return {
        form: { ...state.form, ...updates },
        updatedFields: changed,
        validationResult: null,
        summaryText: null,
      };
    }),

  resetForm: () =>
    set({
      form: { ...defaultForm },
      updatedFields: new Set(),
      validationResult: null,
      summaryText: null,
    }),

  clearUpdated: () => set({ updatedFields: new Set() }),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setLoading: (v) => set({ isLoading: v }),
  setToolActive: (t) => set({ toolActive: t }),
  setValidation: (v) => set({ validationResult: v }),
  setSummary: (s) => set({ summaryText: s }),

  pushHistory: (role, content) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, { role, content }],
    })),
}));
