export type AdminSearchResult = {
  id: string;
  formattedAddress: string;
  nationalPhoneNumber: string;
  displayName: string;
};

export type AdminSearchResponse = {
  data: AdminSearchResult[];
  count: number;
};
