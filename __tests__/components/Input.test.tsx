import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import NewInput from '../../src/components/input/NewInput';
import { InputVariant, InputSize, InputState } from '../../src/components/input/StyledNewInput';
import { LightTheme } from '../../src/util/LightTheme';

// Import jest-dom matchers
import '@testing-library/jest-dom';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={LightTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('NewInput Component', () => {

  it('renders with label when provided', () => {
    renderWithTheme(<NewInput label="Test Label" placeholder="Enter text" />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with helper text when provided', () => {
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        helperText="This is helper text" 
      />
    );
    
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('renders with error message when provided', () => {
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        error="This field is required" 
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders with success message when provided', () => {
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        success="Input is valid" 
      />
    );
    
    expect(screen.getByText('Input is valid')).toBeInTheDocument();
  });

  it('handles onChange event correctly', () => {
    const handleChange = jest.fn();
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        onChange={handleChange} 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'test input' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test input');
  });

  it('handles onFocus and onBlur events correctly', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('applies different variants correctly', () => {
    const { rerender } = renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        variant={InputVariant.OUTLINED} 
      />
    );
    
    let input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    
    rerender(
      <ThemeProvider theme={LightTheme}>
        <NewInput 
          placeholder="Enter text" 
          variant={InputVariant.FULFILLED} 
        />
      </ThemeProvider>
    );
    
    input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        size={InputSize.SMALL} 
      />
    );
    
    let input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    
    rerender(
      <ThemeProvider theme={LightTheme}>
        <NewInput 
          placeholder="Enter text" 
          size={InputSize.LARGE} 
        />
      </ThemeProvider>
    );
    
    input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('applies fullWidth prop correctly', () => {
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        fullWidth={true} 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        disabled={true} 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeDisabled();
  });

  it('handles different input types correctly', () => {
    const { rerender } = renderWithTheme(
      <NewInput 
        placeholder="Enter email" 
        type="email" 
      />
    );
    
    let input = screen.getByPlaceholderText('Enter email');
    expect(input).toHaveAttribute('type', 'email');
    
    rerender(
      <ThemeProvider theme={LightTheme}>
        <NewInput 
          placeholder="Enter password" 
          type="password" 
        />
      </ThemeProvider>
    );
    
    input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('handles required attribute correctly', () => {
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        required={true} 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeRequired();
  });

  it('handles maxLength attribute correctly', () => {
    renderWithTheme(
      <NewInput 
        placeholder="Enter text" 
        maxLength={10} 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveAttribute('maxLength', '10');
  });
});
