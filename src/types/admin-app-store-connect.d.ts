export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface DailyInstallData {
  date: string;
  installs: number;
  countries: { [key: string]: number };
}

interface InstallData {
  dates: DailyInstallData[];
  totalInstalls: number;
  countries: { [key: string]: number };
}

interface ReportRow {
  'Product Type Identifier': string;
  'Country Code': string;
  Units: string;
  'Begin Date': string;
  SKU: string;
}

export type AdminAppStoreConnectTrendsResponse = {
  message: string;
  data: InstallData;
};
