import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Modal from '../../src/components/modal/Modal';
import { LightTheme } from '../../src/util/LightTheme';
import Button from '../../src/components/button/Button';
import { ButtonType } from '../../src/components/button/StyledButton';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={LightTheme}>
      {component}
    </ThemeProvider>
  );
};

// Mock Portal to avoid DOM issues in tests
jest.mock('../../src/components/common/Portal', () => {
  return function MockPortal({ children }: { children: React.ReactNode }) {
    return <div data-testid="portal">{children}</div>;
  };
});

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  const mockAcceptButton = (
    <Button
      text="Accept"
      size="MEDIUM"
      buttonType={ButtonType.DEFAULT}
    />
  );

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when show is true', () => {
    renderWithTheme(
      <Modal
        show={true}
        title="Test Modal"
        text="This is a test modal"
        onClose={mockOnClose}
        acceptButton={mockAcceptButton}
      />
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('This is a test modal')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    renderWithTheme(
      <Modal
        show={false}
        title="Test Modal"
        text="This is a test modal"
        onClose={mockOnClose}
        acceptButton={mockAcceptButton}
      />
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    renderWithTheme(
      <Modal
        show={true}
        title="Test Modal"
        text="This is a test modal"
        onClose={mockOnClose}
        acceptButton={mockAcceptButton}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders accept button', () => {
    renderWithTheme(
      <Modal
        show={true}
        title="Test Modal"
        text="This is a test modal"
        onClose={mockOnClose}
        acceptButton={mockAcceptButton}
      />
    );
    
    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  it('renders with image when provided', () => {
    const testImageSrc = 'test-image.png';
    
    renderWithTheme(
      <Modal
        show={true}
        title="Test Modal"
        text="This is a test modal"
        img={testImageSrc}
        onClose={mockOnClose}
        acceptButton={mockAcceptButton}
      />
    );
    
    const image = screen.getByAltText('modal');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', testImageSrc);
  });

  it('renders without text when not provided', () => {
    renderWithTheme(
      <Modal
        show={true}
        title="Test Modal"
        onClose={mockOnClose}
        acceptButton={mockAcceptButton}
      />
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('is accessible with proper structure', () => {
    renderWithTheme(
      <Modal
        show={true}
        title="Test Modal"
        text="This is a test modal"
        onClose={mockOnClose}
        acceptButton={mockAcceptButton}
      />
    );
    
    // Check if portal is rendered
    expect(screen.getByTestId('portal')).toBeInTheDocument();
  });
});
