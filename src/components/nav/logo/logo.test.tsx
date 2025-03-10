import { render, screen } from '@testing-library/react';
import { Logo } from './logo';
import { vi, describe, it, expect } from 'vitest';

// Mock the next/image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid='logo-image'
    />
  ),
}));

describe('Logo', () => {
  it('renders the logo image with correct attributes', () => {
    render(<Logo />);

    const logoImage = screen.getByTestId('logo-image');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/logo-no-background.png');
    expect(logoImage).toHaveAttribute('alt', 'Emoji Map Logo');
    expect(logoImage).toHaveAttribute('width', '56');
    expect(logoImage).toHaveAttribute('height', '56');
    expect(logoImage).toHaveClass('mr-3 rounded-xl shadow-sm');
  });

  it('renders the logo text', () => {
    render(<Logo />);

    const logoText = screen.getByText('Emoji Map');
    expect(logoText).toBeInTheDocument();
    expect(logoText).toHaveClass('text-white font-bold text-xl');
  });
});
