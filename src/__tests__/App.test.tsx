/**
 * App 컴포넌트 테스트
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('App', () => {
  describe('기본 렌더링', () => {
    it('should render intro page by default', () => {
      render(<App />);

      expect(screen.getByText('💸 돈 감각 테스트')).toBeInTheDocument();
    });

    it('should have app container', () => {
      const { container } = render(<App />);

      expect(container.querySelector('.app')).toBeInTheDocument();
    });
  });

  describe('라우팅', () => {
    it('should render intro page at root path', () => {
      render(<App />);

      expect(screen.getByText('💸 돈 감각 테스트')).toBeInTheDocument();
    });
  });
});
