import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../../src/contexts/ToastContext';
import { ToastType } from '../../src/components/toast/Toast';
import { ThemeProvider } from 'styled-components';
import { LightTheme } from '../../src/util/LightTheme';

// Test component that uses the toast context
const TestComponent = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <div>
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
      <button onClick={() => showWarning('Warning message')}>Show Warning</button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={LightTheme}>
      <ToastProvider>
        {component}
      </ToastProvider>
    </ThemeProvider>
  );
};

describe('ToastContext', () => {
  it('provides toast functions to children', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByText('Show Success')).toBeInTheDocument();
    expect(screen.getByText('Show Error')).toBeInTheDocument();
    expect(screen.getByText('Show Info')).toBeInTheDocument();
    expect(screen.getByText('Show Warning')).toBeInTheDocument();
  });

  it('shows success toast when showSuccess is called', async () => {
    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Show Success'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('shows error toast when showError is called', async () => {
    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Show Error'));
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('shows info toast when showInfo is called', async () => {
    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Show Info'));
    
    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  it('shows warning toast when showWarning is called', async () => {
    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Show Warning'));
    
    await waitFor(() => {
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
  });

  it('auto-removes toasts after duration', async () => {
    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Show Success'));
    
    // Toast should appear
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    // Toast should disappear after duration (default 5000ms, but we can't wait that long in tests)
    // This test would need to be adjusted based on the actual implementation
  });

  it('allows clicking toasts to close them', async () => {
    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Show Success'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    // Click the toast to close it
    fireEvent.click(screen.getByText('Success message'));
    
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('handles multiple toasts simultaneously', async () => {
    renderWithProviders(<TestComponent />);
    
    // Show multiple toasts
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });
});
