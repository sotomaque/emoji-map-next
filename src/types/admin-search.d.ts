export type MerchantPlaceSearchResult = {
  id: string;
  formattedAddress: string;
  nationalPhoneNumber: string;
  displayName: string;
};

export type MerchantPlaceSearchResponse = {
  data: MerchantPlaceSearchResult[];
  count: number;
};
