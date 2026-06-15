/** Glint shared domain types. Mirrors the Supabase schema (supabase/migrations). */

export type UserRole = 'customer' | 'technician' | 'site_lead' | 'admin';
export type SiteType = 'office_park' | 'residential';
export type SiteStatus = 'live' | 'onboarding' | 'paused';
export type WashStatus =
  | 'booked'
  | 'scheduled'
  | 'en_route'
  | 'arrived'
  | 'checked_in'
  | 'in_progress'
  | 'ready'
  | 'done'
  | 'collected'
  | 'cancelled';
export type KeyMode = 'no_key' | 'lockbox';
export type ServiceMode = 'station' | 'roving';
export type ProofPhase = 'pre' | 'post' | 'progress';
export type TechStatus = 'available' | 'washing' | 'break' | 'offline';
export type AcademyStage = 'week_1' | 'week_2' | 'certified';
export type InvoiceStatus = 'paid' | 'due' | 'overdue';
export type PlanPeriod = 'mo' | 'wk';

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  member_since: string | null;
  site_id: string | null;
}

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  area: string;
  bays: string | null;
  hours: string | null;
  target: number;
  status: SiteStatus;
  service_mode: ServiceMode;
  capacity: number;
  slot_minutes: number;
  open_time: string;
  close_time: string;
  lead_id: string | null;
}

export interface Car {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  trim: string | null;
  color: string | null;
  plate: string | null;
  tone: string;
  is_primary: boolean;
}

export interface ServiceTier {
  id: string;
  name: string;
  price_cents: number;
  mins: number;
  description: string | null;
  includes: string[];
  popular: boolean;
  sort: number;
}

export interface Plan {
  id: string;
  name: string;
  price_cents: number;
  period: PlanPeriod;
  washes_label: string | null;
  description: string | null;
  includes: string[];
  popular: boolean;
  sort: number;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  car_id: string | null;
  days: string[];
  status: string;
  price_cents: number;
  billing_card: string | null;
  next_billing: string | null;
}

export interface Wash {
  id: string;
  customer_id: string;
  car_id: string | null;
  site_id: string | null;
  technician_id: string | null;
  tier: string;
  status: WashStatus;
  key_mode: KeyMode;
  scheduled_for: string | null;
  started_at: string | null;
  eta_done: string | null;
  pct: number;
  rating: number | null;
  litres_saved: number;
  price_cents: number;
  is_subscription: boolean;
  created_at: string;
  // Secure drop-off handoff
  drop_off_code: string | null;
  collection_code: string | null;
  bay_label: string | null;
  checked_in_at: string | null;
  ready_at: string | null;
  collected_at: string | null;
}

export interface WashStep {
  id: string;
  wash_id: string;
  key: string;
  label: string;
  sub: string | null;
  at_label: string | null;
  done: boolean;
  active: boolean;
  sort: number;
}

export interface ChecklistItem {
  id: string;
  wash_id: string;
  item: string;
  checked: boolean;
  sort: number;
}

export interface WashProof {
  id: string;
  wash_id: string;
  label: string;
  storage_path: string;
  phase: ProofPhase;
  note: string | null;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  brand: string;
  last4: string;
  exp: string | null;
  is_primary: boolean;
}

export interface Invoice {
  id: string;
  customer_id: string;
  ref: string;
  label: string;
  amount_cents: number;
  status: InvoiceStatus;
  issued_on: string;
}

/** Format integer cents (ZAR) as e.g. "R750". */
export const fmtR = (cents: number): string =>
  'R' + Math.round(cents / 100).toLocaleString('en-ZA');
