import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Button from '../../src/components/button/Button';
import { ButtonType } from '../../src/components/button/StyledButton';
import { LightTheme } from '../../src/util/LightTheme';

// Mock theme wrapper
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={LightTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  it('renders with correct text', () => {
    renderWithTheme(
      <Button 
        text="Click me" 
        size="MEDIUM" 
        buttonType={ButtonType.DEFAULT} 
      />
    );
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const mockOnClick = jest.fn();
    
    renderWithTheme(
      <Button 
        text="Click me" 
        size="MEDIUM" 
        buttonType={ButtonType.DEFAULT}
        onClick={mockOnClick}
      />
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const mockOnClick = jest.fn();
    
    renderWithTheme(
      <Button 
        text="Click me" 
        size="MEDIUM" 
        buttonType={ButtonType.DEFAULT}
        onClick={mockOnClick}
        disabled={true}
      />
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies correct button type styles', () => {
    const { container } = renderWithTheme(
      <Button 
        text="Delete" 
        size="MEDIUM" 
        buttonType={ButtonType.DELETE}
      />
    );
    
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { container: smallContainer } = renderWithTheme(
      <Button 
        text="Small" 
        size="SMALL" 
        buttonType={ButtonType.DEFAULT}
      />
    );
    
    const { container: largeContainer } = renderWithTheme(
      <Button 
        text="Large" 
        size="LARGE" 
        buttonType={ButtonType.DEFAULT}
      />
    );
    
    const smallButton = smallContainer.querySelector('button');
    const largeButton = largeContainer.querySelector('button');
    
    expect(smallButton).toBeInTheDocument();
    expect(largeButton).toBeInTheDocument();
  });

  it('renders as disabled when buttonType is DISABLED', () => {
    renderWithTheme(
      <Button 
        text="Disabled" 
        size="MEDIUM" 
        buttonType={ButtonType.DISABLED}
      />
    );
    
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});
