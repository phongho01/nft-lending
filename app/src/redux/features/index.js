import { combineReducers } from '@reduxjs/toolkit';
import accountReducer from './accountSlice';
import rateReducer from './rateSlice';

const rootReducer = combineReducers({
  account: accountReducer,
  rate: rateReducer,
});

export default rootReducer;
