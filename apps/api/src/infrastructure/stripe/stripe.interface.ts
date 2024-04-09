export interface ICreateStripeCustomer {
  email: string;
  name: string | null;
  internalUserId?: string;
}
export interface IStripeService {
  createCustomer(props: ICreateStripeCustomer): Promise<string | undefined>; // Returns Stripe Customer ID
}
