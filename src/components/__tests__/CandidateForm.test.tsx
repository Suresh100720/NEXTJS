import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CandidateForm from '../CandidateForm';
import { handleCandidateAction, enrichCVAction } from '@/lib/actions';

// Mock the next-auth react module
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}));

// Mock the Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/candidates',
}));

// Mock the server actions inside actions.ts
vi.mock('@/lib/actions', () => {
  return {
    handleCandidateAction: vi.fn(),
    enrichCVAction: vi.fn(),
  };
});

describe('CandidateForm Component (Vitest + RTL + Server Action Mocking)', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the manual input form fields correctly', () => {
    render(<CandidateForm onClose={mockOnClose} />);

    // Check header text
    expect(screen.getByText('Candidate Profile')).toBeInTheDocument();
    
    // Check main input labels
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Candidate/i })).toBeInTheDocument();
  });

  it('should validate form submission and invoke mocked handleCandidateAction server action', async () => {
    vi.mocked(handleCandidateAction).mockResolvedValue({
      success: true,
      message: 'Candidate saved successfully',
    });

    render(<CandidateForm onClose={mockOnClose} />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);

    // Type candidate details
    await userEvent.type(nameInput, 'Alex Smith');
    await userEvent.type(emailInput, 'alex@example.com');

    expect(nameInput).toHaveValue('Alex Smith');
    expect(emailInput).toHaveValue('alex@example.com');

    const submitBtn = screen.getByRole('button', { name: /Confirm Candidate/i });
    
    // Trigger form submit
    fireEvent.click(submitBtn);

    // Confirm the mock server action was called
    await waitFor(() => {
      expect(handleCandidateAction).toHaveBeenCalledTimes(1);
    });
  });

  it('should trigger AI CV parser and auto-fill input fields when a resume is uploaded', async () => {
    // Mock the enrichCVAction to simulate successful LLM CV parsing
    vi.mocked(enrichCVAction).mockResolvedValue({
      name: 'Jane Doe',
      email: 'jane@example.com',
      suggestedRole: 'Frontend Developer',
      experience: '3',
      skills: ['React', 'TypeScript', 'Next.js'],
    });

    render(<CandidateForm onClose={mockOnClose} />);

    // Find the file input field
    const fileInput = screen.getByLabelText(/Upload CV/i);
    
    // Simulate a file upload event
    const file = new File(['dummy content'], 'jane_doe_cv.pdf', { type: 'application/pdf' });
    await userEvent.upload(fileInput, file);

    // Verify parser action was called
    await waitFor(() => {
      expect(enrichCVAction).toHaveBeenCalledTimes(1);
    });

    // Check if fields are automatically populated by the mocked response
    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Jane Doe');
      expect(screen.getByLabelText(/Email Address/i)).toHaveValue('jane@example.com');
    });
  });
});
