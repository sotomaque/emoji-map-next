import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { gunzip } from 'zlib';
import jwt from 'jsonwebtoken';
import { env } from '@/env';
import type {
  AdminAppStoreConnectTrendsResponse,
  DailyInstallData,
  Frequency,
  InstallData,
  ReportRow,
} from '@/types/admin-app-store-connect';
import type { ErrorResponse } from '@/types/error-response';

// Promisify gunzip for async/await usage
const gunzipAsync = promisify(gunzip);

// Configuration
const BASE_URL = env.APP_STORE_CONNECT_BASE_URL;
const ISSUER_ID = env.APP_STORE_CONNECT_ISSUER_ID;
const KEY_ID = env.APP_STORE_CONNECT_KEY_ID;
const PRIVATE_KEY = env.APP_STORE_CONNECT_PRIVATE_KEY;
const VENDOR_NUMBER = env.APP_STORE_CONNECT_VENDOR_NUMBER;
const APP_SKU = env.APP_STORE_CONNECT_APP_SKU;

// Generate JWT Token
function generateToken(): string {
  const payload = {
    iss: ISSUER_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 1200, // 20 minutes
    aud: 'appstoreconnect-v1',
  };

  const options: jwt.SignOptions = {
    algorithm: 'ES256', // Specify the algorithm
    header: {
      alg: 'ES256', // Explicitly include alg in the header
      kid: KEY_ID, // Key ID
    },
  };

  return jwt.sign(payload, PRIVATE_KEY, options);
}

function isDateAvailable(date: Date): boolean {
  const now = new Date();
  const pacificTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  );
  const japanTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
  );
  const europeTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Paris' })
  );

  // Reports are available after 5 AM in respective time zones
  const pacificCutoff = new Date(pacificTime);
  pacificCutoff.setHours(5, 0, 0, 0);

  const japanCutoff = new Date(japanTime);
  japanCutoff.setHours(5, 0, 0, 0);

  const europeCutoff = new Date(europeTime);
  europeCutoff.setHours(5, 0, 0, 0);

  // Check if the requested date is before today
  const isBeforeToday = date.getTime() < now.setHours(0, 0, 0, 0);

  // If requesting yesterday or earlier, data should be available
  if (isBeforeToday) {
    return true;
  }

  // For today's data, check time zone cutoffs
  return (
    pacificTime.getTime() >= pacificCutoff.getTime() &&
    japanTime.getTime() >= japanCutoff.getTime() &&
    europeTime.getTime() >= europeCutoff.getTime()
  );
}

function calculateReportDates(frequency: Frequency, date?: string): string[] {
  const now = new Date();

  if (!date) {
    switch (frequency) {
      case 'DAILY': {
        // Get the last 5 days starting from day before yesterday
        const dates: string[] = [];
        for (let i = 2; i <= 6; i++) {
          const pastDate = new Date(now);
          pastDate.setDate(pastDate.getDate() - i);
          if (isDateAvailable(pastDate)) {
            dates.push(pastDate.toISOString().split('T')[0]);
          }
        }
        return dates.reverse(); // Return in chronological order
      }

      case 'WEEKLY': {
        // Get the last 5 weeks, each ending on Sunday
        const dates: string[] = [];
        const lastSunday = new Date(now);
        lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay() - 7); // Get last Sunday

        for (let i = 0; i < 5; i++) {
          dates.push(lastSunday.toISOString().split('T')[0]);
          lastSunday.setDate(lastSunday.getDate() - 7); // Go back one week
        }
        return dates.reverse(); // Return in chronological order
      }

      case 'MONTHLY': {
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return [
          `${lastMonth.getFullYear()}-${String(
            lastMonth.getMonth() + 1
          ).padStart(2, '0')}`,
        ];
      }

      default:
        throw new Error('Invalid frequency');
    }
  }

  // If date is provided, validate it matches the frequency format
  if (frequency === 'MONTHLY') {
    if (!/^\d{4}-\d{2}$/.test(date)) {
      throw new Error('Monthly date must be in YYYY-MM format');
    }
    return [date];
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    const requestedDate = new Date(date);

    // For daily reports, check if data is available
    if (frequency === 'DAILY' && !isDateAvailable(requestedDate)) {
      throw new Error(
        'Report data is not available yet for the requested date'
      );
    }

    if (frequency === 'WEEKLY') {
      // Ensure the date is a Sunday
      if (requestedDate.getDay() !== 0) {
        throw new Error('Weekly reports must specify a Sunday date');
      }
    }

    return [date];
  }
}

function processReportData(
  data: ReportRow[],
  reportDates: string[]
): InstallData {
  const dailyData: DailyInstallData[] = [];
  const totalCountries: { [key: string]: number } = {};
  let totalInstalls = 0;

  // Process each date's data
  reportDates.forEach((reportDate) => {
    const installsByCountry: { [key: string]: number } = {};
    let dateInstalls = 0;

    // Convert ISO date to MM/DD/YYYY format for comparison
    const [year, month, day] = reportDate.split('-');
    const formattedReportDate = `${month}/${day}/${year}`;

    // Get day name
    const date = new Date(reportDate);
    const dayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
    }).format(date);
    const displayDate = `${dayName}`;

    // Filter for matching date, install-related product types, and matching SKU
    const dateData = data.filter((row) => {
      const isMatchingDate = row['Begin Date'] === formattedReportDate;
      const isValidType = ['1', '1F', '7'].includes(
        row['Product Type Identifier']
      );
      const isMatchingSku = row['SKU'] === APP_SKU;

      return isMatchingDate && isValidType && isMatchingSku;
    });

    // Group by country
    dateData.forEach((row) => {
      const country = row['Country Code'];
      const units = parseInt(row['Units']) || 0;

      installsByCountry[country] = (installsByCountry[country] || 0) + units;
      totalCountries[country] = (totalCountries[country] || 0) + units;
      dateInstalls += units;
      totalInstalls += units;
    });

    dailyData.push({
      date: displayDate,
      installs: dateInstalls,
      countries: installsByCountry,
    });
  });

  return {
    dates: dailyData,
    totalInstalls,
    countries: totalCountries,
  };
}

// GET handler for the route
export async function GET(
  request: Request
): Promise<NextResponse<AdminAppStoreConnectTrendsResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const frequency = (
      searchParams.get('frequency') || 'DAILY'
    ).toUpperCase() as Frequency;
    const date = searchParams.get('date') || undefined;

    if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be DAILY, WEEKLY, or MONTHLY' },
        { status: 400 }
      );
    }

    const reportDates = calculateReportDates(frequency, date);
    const token = generateToken();

    // Fetch data for all dates
    const allData: ReportRow[] = [];
    for (const reportDate of reportDates) {
      const params = new URLSearchParams({
        'filter[frequency]': frequency,
        'filter[reportType]': 'SALES',
        'filter[reportSubType]': 'SUMMARY',
        'filter[vendorNumber]': VENDOR_NUMBER,
        'filter[reportDate]': reportDate,
      });

      const url = `${BASE_URL}/v1/salesReports?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/a-gzip',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        return NextResponse.json(
          {
            error: `HTTP error! Status: ${response.status}`,
            details: errorText,
          },
          { status: response.status }
        );
      }

      const reportData = await response.arrayBuffer();
      const buffer = Buffer.from(reportData);
      const decompressed = await gunzipAsync(buffer);
      const reportText = decompressed.toString('utf8');

      const rows = reportText.split('\n').filter(Boolean);
      const headers = rows[0].split('\t');

      const data = rows.slice(1).map((row) => {
        const values = row.split('\t');
        const record = headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);

        const reportRow = {
          'Product Type Identifier': record['Product Type Identifier'] || '',
          'Country Code': record['Country Code'] || '',
          Units: record['Units'] || '0',
          'Begin Date': record['Begin Date'] || '',
          SKU: record['SKU'] || '',
        } as ReportRow;

        return reportRow;
      });

      allData.push(...data);
    }

    const installData = processReportData(allData, reportDates);

    return NextResponse.json({
      message: 'App install data fetched successfully',
      data: installData,
    });
  } catch (error) {
    console.error('Error fetching install data:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch install data',
      },
      { status: 500 }
    );
  }
}
