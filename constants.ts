
import { WasteType } from './types';

export const WASTE_RATES: WasteType[] = [
  { id: 'plastic', name: 'Plastic', ratePerKg: 15, color: 'bg-blue-500' },
  { id: 'paper', name: 'Paper', ratePerKg: 14, color: 'bg-yellow-500' },
  { id: 'metal', name: 'Metal', ratePerKg: 32, color: 'bg-slate-500' },
  { id: 'glass', name: 'Glass', ratePerKg: 4, color: 'bg-emerald-500' },
  { id: 'organic', name: 'Organic', ratePerKg: 2, color: 'bg-green-700' },
];

export const AUTH_TOKEN_KEY = 'ecocycle_auth_token';
export const USER_DATA_KEY = 'ecocycle_user_data';
