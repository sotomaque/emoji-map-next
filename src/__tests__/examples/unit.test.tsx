import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';

// Simple component for testing
const ExampleComponent = ({ text }: { text: string }) => {
  return <div data-testid='example'>{text}</div>;
};

describe('Example Unit Test', () => {
  it('renders the component with the provided text', () => {
    const testText = 'Hello, World!';
    render(<ExampleComponent text={testText} />);

    const element = screen.getByTestId('example');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe(testText);
  });
});
