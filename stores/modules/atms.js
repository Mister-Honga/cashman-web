import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { firestore } from '../../lib/firebase';

export const getATmInfoAsync = createAsyncThunk(
    "atms/getATMInfoAsync",
    async(args, thunkAPI) =>{
        try{
            console.log(args);

        }catch (error){
            console.log(error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const getATMsAsync = createAsyncThunk(
    "atms/getATMsAsync",
    async(thunkAPI) =>{
        try{
            let atms =[];
            const atmsRef = firestore.collection("atms");

            await atmsRef.get().then(snapshot => {
                snapshot.forEach(doc => {
                    atms.push({
                        location: doc.id,
                        aud100: doc.data().aud100,
                        aud50: doc.data().aud50,
                        aud20: doc.data().aud20,
                        aud10: doc.data().aud10,
                        auc5: doc.data().auc5,
                        auc10: doc.data().auc10,
                        auc20: doc.data().auc20,
                        auc50: doc.data().auc50
                    });
                });
            })
                .catch(err => {
                    console.log('Error getting documents', err);
                });
            return { atmsData: atms };
        }catch (error){
            console.log(error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const updateATMAsync = createAsyncThunk(
    "atms/updateATMAsync",
    async(args, thunkAPI) =>{
        try{
            let updateResult =false;
            let tempData = {...args};
            const location = args.location;
            delete tempData.location;

            const atmsRef = firestore.collection("atms").doc(location);
            await atmsRef.update(tempData).then(result=>{
                updateResult = true;
                console.log(`Document successfully updated!`);
            })

            return { updateResult: updateResult};
        }catch (error){
            console.log(error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)


const slice  = createSlice({
    name: "atms",
    initialState:{
        atmsData: null,
        error: null,
    },
    reducers:{
        storeATMs: ((state, action) => {
            state.atmsData = action.payload;
        }),
        clearErrMessage: (state) => {
            // state.errMessage = null;
        }
    },
    extraReducers:{
        [getATMsAsync.pending]: (state, action) =>{
            // state.errMessage = null;
        },
        [getATMsAsync.fulfilled]: (state, action) =>{
            state.atmsData = action.payload.atmsData;
            // state.errMessage = null;
        },
        [getATMsAsync.rejected]: (state, action) =>{
            // state.errMessage = action.payload.message;
        },
        [updateATMAsync.pending]: (state, action) =>{
            // state.errMessage = null;
        },
        [updateATMAsync.fulfilled]: (state, action) =>{
            state.updateResult = action.payload.updateResult;
            // state.errMessage = null;
        },
        [updateATMAsync.rejected]: (state, action) =>{
            // state.errMessage = action.payload.message;
        }

    }
})

export const { storeATMs, clearErrMessage } = slice.actions;

export default slice.reducer;