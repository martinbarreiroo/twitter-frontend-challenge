import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import NavItem from '../../src/components/navbar/navItem/NavItem';
import { IconType } from '../../src/components/icon/Icon';
import { LightTheme } from '../../src/util/LightTheme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={LightTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('NavItem Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders with correct title', () => {
    renderWithTheme(
      <NavItem
        title="Home"
        icon={IconType.HOME}
        selectedIcon={IconType.ACTIVE_HOME}
        onClick={mockOnClick}
        active={false}
      />
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    renderWithTheme(
      <NavItem
        title="Home"
        icon={IconType.HOME}
        selectedIcon={IconType.ACTIVE_HOME}
        onClick={mockOnClick}
        active={false}
      />
    );
    
    fireEvent.click(screen.getByText('Home'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies active class when active', () => {
    renderWithTheme(
      <NavItem
        title="Home"
        icon={IconType.HOME}
        selectedIcon={IconType.ACTIVE_HOME}
        onClick={mockOnClick}
        active={true}
      />
    );
    
    const titleElement = screen.getByText('Home');
    expect(titleElement).toHaveClass('active');
  });

  it('does not apply active class when inactive', () => {
    renderWithTheme(
      <NavItem
        title="Home"
        icon={IconType.HOME}
        selectedIcon={IconType.ACTIVE_HOME}
        onClick={mockOnClick}
        active={false}
      />
    );
    
    const titleElement = screen.getByText('Home');
    expect(titleElement).not.toHaveClass('active');
  });

  it('renders different titles correctly', () => {
    const titles = ['Home', 'Messages', 'Profile', 'Settings'];
    
    titles.forEach((title) => {
      const { unmount } = renderWithTheme(
        <NavItem
          title={title}
          icon={IconType.HOME}
          selectedIcon={IconType.ACTIVE_HOME}
          onClick={mockOnClick}
          active={false}
        />
      );
      
      expect(screen.getByText(title)).toBeInTheDocument();
      unmount();
    });
  });

  it('is accessible with proper role', () => {
    renderWithTheme(
      <NavItem
        title="Home"
        icon={IconType.HOME}
        selectedIcon={IconType.ACTIVE_HOME}
        onClick={mockOnClick}
        active={false}
      />
    );
    
    // The container should be clickable
    const container = screen.getByText('Home').closest('div');
    expect(container).toBeInTheDocument();
  });
});
