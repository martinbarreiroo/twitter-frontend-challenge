import { renderHook } from '@testing-library/react';
import { useClickOutside } from '../../src/hooks/useClickOutside';
import { fireEvent } from '@testing-library/react';

describe('useClickOutside Hook', () => {
  let mockCallback: jest.Mock;
  let element: HTMLDivElement;

  beforeEach(() => {
    mockCallback = jest.fn();
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    jest.clearAllMocks();
  });

  it('calls callback when clicking outside element', () => {
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockCallback));
    
    // Simulate ref assignment
    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true
    });

    // Click outside the element
    fireEvent.mouseDown(document.body);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when clicking inside element', () => {
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockCallback));
    
    // Simulate ref assignment
    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true
    });

    // Click inside the element
    fireEvent.mouseDown(element);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('does not call callback when ref is null', () => {
    renderHook(() => useClickOutside<HTMLDivElement>(mockCallback));

    // Click anywhere since ref is null
    fireEvent.mouseDown(document.body);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useClickOutside<HTMLDivElement>(mockCallback));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});
