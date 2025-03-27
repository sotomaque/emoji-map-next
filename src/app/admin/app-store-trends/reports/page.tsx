'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GB as GBFlag,
  US as USFlag,
  MX as MXFlag,
  CA as CAFlag,
} from 'country-flag-icons/react/3x2';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  AdminAppStoreConnectTrendsResponse,
  Frequency,
  InstallData,
} from '@/types/admin-app-store-connect';

// Feature flags
const IS_WEEKLY_ENABLED = false;
const IS_MONTHLY_ENABLED = false;

// Types
type TimeFrameLabels = {
  [K in Frequency]?: string;
} & {
  DAILY: string; // DAILY is always required
};

// API fetch function
async function fetchInstallData(
  timeFrame: Frequency
): Promise<AdminAppStoreConnectTrendsResponse> {
  const response = await fetch(
    `/api/admin/app-store-connect/trends?frequency=${timeFrame}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch install data');
  }
  const data = await response.json();

  return data;
}

// Custom hook for fetching install data
function useInstallData(timeFrame: Frequency) {
  return useQuery<AdminAppStoreConnectTrendsResponse, Error>({
    queryKey: ['installs', timeFrame],
    queryFn: () => fetchInstallData(timeFrame),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

const chartConfig = {
  installs: {
    label: 'Installs',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

// Country name mapping
const countryNames: {
  [key: string]: { name: string; flag?: React.ComponentType };
} = {
  US: { name: 'United States', flag: USFlag },
  MX: { name: 'Mexico', flag: MXFlag },
  CA: { name: 'Canada', flag: CAFlag },
  GB: { name: 'United Kingdom', flag: GBFlag },
};

// Chart component
function InstallChart({
  data,
  timeFrame,
}: {
  data: InstallData;
  timeFrame: Frequency;
}) {
  const chartData =
    timeFrame === 'MONTHLY'
      ? [
          {
            date: data.dates[0].date,
            installs: data.totalInstalls,
          },
        ]
      : data.dates;

  // Calculate trend
  const trend =
    chartData.length > 1
      ? ((chartData[chartData.length - 1].installs - chartData[0].installs) /
          chartData[0].installs) *
        100
      : 0;

  return (
    <>
      <ChartContainer config={chartConfig}>
        {timeFrame === 'MONTHLY' ? (
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type='monotone'
              dataKey='installs'
              stroke='var(--color-installs)'
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey='installs'
              fill='var(--color-installs)'
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        )}
      </ChartContainer>
      <CardFooter className='flex-col items-start gap-2 text-sm mt-4'>
        {trend !== 0 && (
          <div className='flex gap-2 font-medium leading-none'>
            {trend > 0 ? 'Trending up' : 'Trending down'} by{' '}
            {Math.abs(trend).toFixed(1)}%
            {trend > 0 ? (
              <TrendingUp className='h-4 w-4' />
            ) : (
              <TrendingDown className='h-4 w-4' />
            )}
          </div>
        )}
        <div className='leading-none text-muted-foreground'>
          {timeFrame === 'DAILY'
            ? 'Showing daily installs for the last 5 days'
            : timeFrame === 'WEEKLY'
            ? 'Showing weekly installs for the last 5 weeks'
            : 'Showing installs for the last completed month'}
        </div>
      </CardFooter>
    </>
  );
}

// Loading skeleton
function ChartSkeleton() {
  return (
    <div className='w-full h-[400px] flex items-center justify-center'>
      <Skeleton className='w-full h-full' />
    </div>
  );
}

// Error component
function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

// Main page component
export default function AppStoreTrendsPage() {
  const [timeFrame, setTimeFrame] = useState<Frequency>('DAILY');
  const { data, isLoading, error } = useInstallData(timeFrame);

  const availableTimeFrames: TimeFrameLabels = {
    DAILY: 'Daily Downloads',
    ...(IS_WEEKLY_ENABLED ? { WEEKLY: 'Weekly Downloads' } : {}),
    ...(IS_MONTHLY_ENABLED ? { MONTHLY: 'Monthly Downloads' } : {}),
  };

  const numColumns = Object.keys(availableTimeFrames).length;

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader>
          <CardTitle>App Store Downloads</CardTitle>
          <CardDescription>
            Track your app downloads across different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue='DAILY'
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as Frequency)}
          >
            <TabsList className={`grid w-full grid-cols-${numColumns}`}>
              <TabsTrigger value='DAILY'>Daily</TabsTrigger>
              {IS_WEEKLY_ENABLED && (
                <TabsTrigger value='WEEKLY'>Weekly</TabsTrigger>
              )}
              {IS_MONTHLY_ENABLED && (
                <TabsTrigger value='MONTHLY'>Monthly</TabsTrigger>
              )}
            </TabsList>

            {(Object.entries(availableTimeFrames) as [Frequency, string][]).map(
              ([key, label]) => (
                <TabsContent key={key} value={key}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{label}</CardTitle>
                      <CardDescription>
                        {key === 'DAILY'
                          ? 'Shows daily downloads for the last 5 days'
                          : key === 'WEEKLY'
                          ? 'Shows weekly downloads for the last 5 weeks'
                          : 'Shows downloads for the last completed month'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <ChartSkeleton />
                      ) : error ? (
                        <ErrorAlert message={error.message} />
                      ) : data ? (
                        <InstallChart data={data.data} timeFrame={key} />
                      ) : null}
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            )}
          </Tabs>
        </CardContent>
      </Card>

      {data && (
        <Card className='mt-8'>
          <CardHeader>
            <CardTitle>Downloads by Country</CardTitle>
            <CardDescription>
              {timeFrame === 'DAILY'
                ? 'Total downloads by country over the last 5 days'
                : 'Breakdown of downloads by country'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {Object.entries(data.data.countries)
                .sort(([, a], [, b]) => b - a) // Sort by download count
                .map(([country, count]) => {
                  const countryInfo = countryNames[country] || {
                    name: country,
                  };
                  const Flag = countryInfo.flag;

                  return (
                    <div
                      key={country}
                      className='p-4 rounded-lg border bg-card text-card-foreground'
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        {Flag && (
                          <div className='w-6 h-4 overflow-hidden rounded'>
                            <Flag />
                          </div>
                        )}
                        <div className='text-sm font-medium'>
                          {countryInfo.name}
                        </div>
                      </div>
                      <div className='text-2xl font-bold'>{count}</div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
