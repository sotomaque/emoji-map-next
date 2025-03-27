import type { Merchant, Place } from '@prisma/client';

type MerchantWithPlaces = Merchant & {
  places: Place[];
};

export type MerchantResponse = {
  merchant: MerchantWithPlaces | null;
};
