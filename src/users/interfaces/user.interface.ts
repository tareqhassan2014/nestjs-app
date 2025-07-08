export interface LastWatchedVideo {
  moduleId: string;
  videoId: string;
  timestamp: Date;
}

export interface StripeCustomer {
  id: string;
  email: string;
  created: number;
  updated: number;
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  amount_paid: number;
  status: string;
}
