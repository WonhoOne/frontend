// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { Button } from '@/shared/ui/Button/Button';
import { OptionCard } from '@/shared/ui/OptionCard/OptionCard';
import { TextField } from '@/shared/ui/TextField/TextField';
import { TextLink } from '@/shared/ui/TextLink/TextLink';

afterEach(cleanup);

describe('Button', () => {
  it('uses native button semantics and does not submit forms by default', () => {
    render(<Button>Continue</Button>);

    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('type', 'button');
  });

  it('disables interaction and exposes a busy state while loading', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button isLoading loadingLabel="Saving" onClick={onClick}>
        Save changes
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Saving' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('preserves explicit disabled state without inventing loading semantics', () => {
    render(<Button disabled>Unavailable</Button>);

    const button = screen.getByRole('button', { name: 'Unavailable' });

    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('aria-busy');
  });
});

describe('TextLink', () => {
  it('uses React Router Link semantics for internal navigation', () => {
    render(
      <MemoryRouter>
        <TextLink to="/tours">Browse tours</TextLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Browse tours' })).toHaveAttribute('href', '/tours');
  });

  it('uses a real anchor when href is provided', () => {
    render(
      <TextLink href="https://example.com/terms" rel="noreferrer">
        Terms
      </TextLink>,
    );

    const link = screen.getByRole('link', { name: 'Terms' });

    expect(link).toHaveAttribute('href', 'https://example.com/terms');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });
});

describe('TextField', () => {
  it('connects a visible label and helper text to the input', () => {
    render(<TextField helperText="Use the name on your booking." label="Name" name="name" />);

    const input = screen.getByRole('textbox', { name: 'Name' });
    const helper = screen.getByText('Use the name on your booking.');

    expect(input).toHaveAttribute('name', 'name');
    expect(input).toHaveAttribute('aria-describedby', helper.id);
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('connects an error state with aria-invalid', () => {
    render(<TextField error="Enter a valid name." label="Name" />);

    const input = screen.getByRole('textbox', { name: 'Name' });
    const error = screen.getByText('Enter a valid name.');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });

  it('passes native required and disabled semantics through', () => {
    render(<TextField disabled label="Email" required type="email" />);

    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(input).toBeDisabled();
    expect(input).toBeRequired();
  });
});

describe('OptionCard', () => {
  it('reflects visual state without creating replacement selection semantics', () => {
    render(
      <OptionCard isDisabled isInvalid isSelected data-testid="option-card">
        <label>
          <input type="radio" name="style" value="sample" />
          Sample option
        </label>
      </OptionCard>,
    );

    const card = screen.getByTestId('option-card');
    const radio = screen.getByRole('radio', { name: 'Sample option' });

    expect(card).toHaveAttribute('data-selected', 'true');
    expect(card).toHaveAttribute('data-disabled', 'true');
    expect(card).toHaveAttribute('data-invalid', 'true');
    expect(card).not.toHaveAttribute('role');
    expect(radio).not.toBeDisabled();
  });
});
