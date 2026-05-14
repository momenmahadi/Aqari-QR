import { Timestamp } from 'firebase/firestore';

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  rooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  description: string;
  ownerId: string;
  type: 'apartment' | 'villa' | 'office' | 'land' | 'other';
  status: 'sale' | 'rent';
  amenities: string[];
  visits?: number;
  createdAt: Timestamp;
}

export interface Lead {
  id: string;
  propertyId: string;
  name?: string;
  phone: string;
  createdAt: Timestamp;
}

export interface CustomUser {
  uid: string;
  displayName: string;
  phone: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
}
