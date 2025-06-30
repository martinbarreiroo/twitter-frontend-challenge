import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Toast, { ToastType } from '../../src/components/toast/Toast';
import { LightTheme } from '../../src/util/LightTheme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={LightTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Toast Component', () => {
  it('renders with correct message', () => {
    renderWithTheme(
      <Toast 
        message="Test message" 
        type={ToastType.SUCCESS}
        show={true}
      />
    );
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('calls onClose when clicked', () => {
    const mockOnClose = jest.fn();
    
    renderWithTheme(
      <Toast 
        message="Test message" 
        type={ToastType.SUCCESS}
        show={true}
        onClose={mockOnClose}
      />
    );
    
    fireEvent.click(screen.getByText('Test message'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after duration', async () => {
    const mockOnClose = jest.fn();
    
    renderWithTheme(
      <Toast 
        message="Test message" 
        type={ToastType.SUCCESS}
        show={true}
        duration={100}
        onClose={mockOnClose}
      />
    );
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  it('does not render when show is false', () => {
    renderWithTheme(
      <Toast 
        message="Test message" 
        type={ToastType.SUCCESS}
        show={false}
      />
    );
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('renders different toast types with appropriate icons', () => {
    const types = [
      ToastType.SUCCESS,
      ToastType.ALERT,
      ToastType.INFO,
      ToastType.WARNING
    ];

    types.forEach((type) => {
      const { container } = renderWithTheme(
        <Toast 
          message={`${type} message`} 
          type={type}
          show={true}
        />
      );
      
      expect(screen.getByText(`${type} message`)).toBeInTheDocument();
      // Check if icon is rendered (SVG or icon element)
      const iconElement = container.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });
  });

  it('does not auto-close when duration is 0', async () => {
    const mockOnClose = jest.fn();
    
    renderWithTheme(
      <Toast 
        message="Test message" 
        type={ToastType.SUCCESS}
        show={true}
        duration={0}
        onClose={mockOnClose}
      />
    );
    
    // Wait a bit to ensure it doesn't auto-close
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
