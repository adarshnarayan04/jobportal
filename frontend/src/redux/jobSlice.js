import { createSlice } from "@reduxjs/toolkit";
const jobSlice = createSlice({
    name: "job",
    initialState: {
        allJobs: null,
        singleJobById: null,
        searchText: "",
        filterText: "",
        apply: false,
        adminJobs: null,
        searchAdminJobs: ""
    },
    reducers: {
        setAllJobs: (state, action) => {
            state.allJobs = action.payload;
        },
        setSingleJobById: (state, action) => {
            state.singleJobById = action.payload;
        },
        setSearchText: (state, action) => {
            state.searchText = action.payload;
        },
        setApply: (state, action) => {
            state.apply = action.payload;
        },
        setAdminJobs: (state, action) => {
            state.adminJobs = action.payload;
        },
        setSearchAdminJobs: (state, action) => {
            state.searchAdminJobs = action.payload;
        },
        setFilterText: (state, action) => {
            state.filterText = action.payload; 
        }
    }
});
export const {
    setAllJobs,
    setSingleJobById,
    setSearchText,
    setApply,
    setAdminJobs,
    setSearchAdminJobs,
    setFilterText
} = jobSlice.actions;
export default jobSlice.reducer;