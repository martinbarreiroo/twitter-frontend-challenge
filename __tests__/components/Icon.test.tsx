import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Icon, IconType, LogoIcon, HomeIcon } from '../../src/components/icon/Icon';

describe('Icon Component', () => {
  it('returns the correct icon component for each icon type', () => {
    const iconMapping = Icon({ width: '24', height: '24' });
    
    // Test that all icon types are mapped
    expect(iconMapping[IconType.HOME]).toBeDefined();
    expect(iconMapping[IconType.ACTIVE_HOME]).toBeDefined();
    expect(iconMapping[IconType.MESSAGE]).toBeDefined();
    expect(iconMapping[IconType.ACTIVE_MESSAGE]).toBeDefined();
    expect(iconMapping[IconType.PROFILE]).toBeDefined();
    expect(iconMapping[IconType.ACTIVE_PROFILE]).toBeDefined();
    expect(iconMapping[IconType.EXPLORE]).toBeDefined();
    expect(iconMapping[IconType.ACTIVE_EXPLORE]).toBeDefined();
    expect(iconMapping[IconType.LOGO]).toBeDefined();
    expect(iconMapping[IconType.BACK_ARROW]).toBeDefined();
    expect(iconMapping[IconType.CANCEL]).toBeDefined();
    expect(iconMapping[IconType.CHAT]).toBeDefined();
    expect(iconMapping[IconType.DISPLAY]).toBeDefined();
    expect(iconMapping[IconType.IMAGE]).toBeDefined();
    expect(iconMapping[IconType.RETWEET]).toBeDefined();
    expect(iconMapping[IconType.LIKE]).toBeDefined();
    expect(iconMapping[IconType.SETTINGS]).toBeDefined();
    expect(iconMapping[IconType.DELETE]).toBeDefined();
    expect(iconMapping[IconType.ALERT]).toBeDefined();
  });
});
