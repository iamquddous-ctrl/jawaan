/**
 * Firestore service layer — handles all reads/writes for
 * products, orders, settings, and users.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, AdminSettings, User } from './types';

// ─── Collection names ────────────────────────────────────────────────────────
const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';
const SETTINGS_DOC = 'settings/admin';
const USERS_COL = 'users';

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, PRODUCTS_COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

export async function saveProduct(product: Product): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, product.id);
  await setDoc(ref, product);
}

export async function saveAllProducts(products: Product[]): Promise<void> {
  // First, get existing product IDs from Firestore
  const existingSnap = await getDocs(collection(db, PRODUCTS_COL));
  const existingIds = new Set(existingSnap.docs.map(d => d.id));
  const newIds = new Set(products.map(p => p.id));

  const batch = writeBatch(db);

  // Write/update all products in the new list
  products.forEach(p => {
    const ref = doc(db, PRODUCTS_COL, p.id);
    batch.set(ref, p);
  });

  // Delete products that are no longer in the list
  existingIds.forEach(id => {
    if (!newIds.has(id)) {
      const ref = doc(db, PRODUCTS_COL, id);
      batch.delete(ref);
    }
  });

  await batch.commit();
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COL, productId));
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const q = query(collection(db, ORDERS_COL), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function saveOrder(order: Order): Promise<void> {
  const ref = doc(db, ORDERS_COL, order.id);
  await setDoc(ref, order);
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const ref = doc(db, ORDERS_COL, orderId);
  await updateDoc(ref, { status });
}

export async function deleteOrder(orderId: string): Promise<void> {
  await deleteDoc(doc(db, ORDERS_COL, orderId));
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<AdminSettings | null> {
  const ref = doc(db, 'settings', 'admin');
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as AdminSettings;
  }
  return null;
}

export async function saveSettings(settings: AdminSettings): Promise<void> {
  const ref = doc(db, 'settings', 'admin');
  await setDoc(ref, settings);
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function fetchUser(email: string): Promise<User | null> {
  const ref = doc(db, USERS_COL, email);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as User;
  }
  return null;
}

export async function saveUser(user: User): Promise<void> {
  const ref = doc(db, USERS_COL, user.email);
  // Never store plain password in Firestore — store everything except password
  const { password, ...safeUser } = user;
  await setDoc(ref, safeUser);
}

export async function fetchAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, USERS_COL));
  return snap.docs.map(d => d.data() as User);
}
