import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import SwitchButton from '../../src/components/switch/SwitchButton';
import { LightTheme } from '../../src/util/LightTheme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={LightTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('SwitchButton Component', () => {
  it('renders in unchecked state', () => {
    const mockOnChange = jest.fn();
    
    renderWithTheme(
      <SwitchButton 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders in checked state', () => {
    const mockOnChange = jest.fn();
    
    renderWithTheme(
      <SwitchButton 
        checked={true} 
        onChange={mockOnChange} 
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const mockOnChange = jest.fn();
    
    const { container } = renderWithTheme(
      <SwitchButton 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    // Click on the container (the visible switch)
    const switchContainer = container.firstChild;
    fireEvent.click(switchContainer as Element);
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('changes visual state when toggled', () => {
    const mockOnChange = jest.fn();
    
    const { rerender } = renderWithTheme(
      <SwitchButton 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    // Simulate prop change
    rerender(
      <ThemeProvider theme={LightTheme}>
        <SwitchButton 
          checked={true} 
          onChange={mockOnChange} 
        />
      </ThemeProvider>
    );
    
    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('has proper accessibility attributes', () => {
    const mockOnChange = jest.fn();
    
    renderWithTheme(
      <SwitchButton 
        checked={false} 
        onChange={mockOnChange} 
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveProperty('type', 'checkbox');
  });
});
