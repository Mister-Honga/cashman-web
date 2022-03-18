import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import atmReducer from "./modules/atms";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";

const reducers = combineReducers({
    atms: atmReducer,
});

const persistConfig = {
    key: "root",
    storage,
};

const _persistedReducer = persistReducer(persistConfig, reducers);


export default configureStore({
    reducer: _persistedReducer,
    // using the getDefaultMiddleware() option to tell the
    // serializability check middleware to ignore those for redux-persist actions.
    middleware: getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
});
