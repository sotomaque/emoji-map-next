export type AdminSearchResult = {
  id: string;
  formattedAddress: string;
  nationalPhoneNumber: string;
  location: {
    latitude: number;
    longitude: number;
  };
  displayName: string;
};

export type AdminSearchResponse = {
  data: AdminSearchResult[];
  count: number;
};
