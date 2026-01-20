
import { PickupRequest, PickupStatus, User, UserRole, Location } from '../types';
import { WASTE_RATES } from '../constants';

const STORAGE_KEY_PICKUPS = 'ecocycle_pickups_v3';
const STORAGE_KEY_USERS = 'ecocycle_users_v3';

const loadPickups = (): PickupRequest[] => {
  const data = localStorage.getItem(STORAGE_KEY_PICKUPS);
  return data ? JSON.parse(data) : [];
};

const savePickups = (pickups: PickupRequest[]) => {
  localStorage.setItem(STORAGE_KEY_PICKUPS, JSON.stringify(pickups));
};

const loadUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const backendApi = {
  login: async (phone: string, fullName: string, role: UserRole, address: string, isSignUp: boolean): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = loadUsers();
    let user = users.find(u => u.phoneNumber === phone);
    
    if (isSignUp) {
      if (user) throw new Error("This phone number is already registered. Please Login instead.");
      user = { id: `u${Date.now()}`, fullName, phoneNumber: phone, role, address, totalEarnings: 0 };
      users.push(user);
    } else {
      if (!user) throw new Error("User not found. Please Sign Up first!");
      if (fullName) user.fullName = fullName;
    }
    
    saveUsers(users);
    return { user, token: 'mock-jwt-' + user.id };
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return users[idx];
  },

  createPickup: async (data: Partial<PickupRequest>): Promise<PickupRequest> => {
    const pickups = loadPickups();
    const newPickup: PickupRequest = {
      id: `P-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: data.userId!,
      userName: data.userName!,
      userPhone: data.userPhone!,
      requestedWasteType: data.requestedWasteType!,
      status: PickupStatus.PENDING,
      requestedAt: new Date().toISOString(),
      address: data.address || 'Unknown',
      location: data.location || { lat: 0, lng: 0 },
    };
    pickups.push(newPickup);
    savePickups(pickups);
    return newPickup;
  },

  getPickups: async (userId?: string, role?: UserRole): Promise<PickupRequest[]> => {
    const pickups = loadPickups();
    if (role === 'ADMIN') return pickups;
    if (role === 'RIDER') return pickups.filter(p => p.status === PickupStatus.PENDING || p.riderId === userId || p.status === PickupStatus.ASSIGNED);
    return pickups.filter(p => p.userId === userId);
  },

  updatePickupStatus: async (id: string, updates: Partial<PickupRequest>): Promise<PickupRequest> => {
    const pickups = loadPickups();
    const idx = pickups.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Pickup not found");
    
    const oldStatus = pickups[idx].status;
    pickups[idx] = { ...pickups[idx], ...updates };

    if (updates.status === PickupStatus.VERIFIED) {
      const rate = WASTE_RATES.find(r => r.name === pickups[idx].verifiedWasteType)?.ratePerKg || 0;
      pickups[idx].totalAmount = Math.round((pickups[idx].verifiedWeight || 0) * rate);
      pickups[idx].verifiedAt = new Date().toISOString();
      pickups[idx].status = PickupStatus.PAYMENT_REQUESTED;
    }

    if (updates.status === PickupStatus.PAID && oldStatus !== PickupStatus.PAID) {
      const users = loadUsers();
      const uIdx = users.findIndex(u => u.id === pickups[idx].userId);
      if (uIdx !== -1) {
        users[uIdx].totalEarnings += pickups[idx].totalAmount || 0;
        saveUsers(users);
      }
    }

    savePickups(pickups);
    return pickups[idx];
  },

  getUserStats: () => {
    const users = loadUsers();
    return {
      recyclers: users.filter(u => u.role === 'USER').length,
      riders: users.filter(u => u.role === 'RIDER').length
    };
  },

  getWasteRates: () => WASTE_RATES,
};
