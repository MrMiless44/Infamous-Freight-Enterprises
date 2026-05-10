import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

function Hello({ name }: { name: string }) {
  return <p>Hello, {name}!</p>;
}

describe('react testing library smoke test', () => {
  it('renders a component into jsdom and asserts text', () => {
    render(<Hello name="Trucker" />);
    expect(screen.getByText('Hello, Trucker!')).toBeInTheDocument();
  });
});
