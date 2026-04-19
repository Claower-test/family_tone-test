/**
 * @file RecordingPanel tests
 * @description Tests for recording panel component
 * @module components/record/RecordingPanel.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordingPanel } from './RecordingPanel';

vi.mock('@/services/audio.service', () => ({
  audioService: {
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/webm' })),
    abort: vi.fn(),
  },
}));

function renderPanel(isOpen: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RecordingPanel isOpen={isOpen} onClose={vi.fn()} />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe('RecordingPanel', () => {
  it('renders nothing when closed', () => {
    const { container } = renderPanel(false);
    expect(container.querySelector('.record-panel')).toBeNull();
  });

  it('renders panel when open', () => {
    renderPanel(true);
    expect(screen.getByText('Запись')).toBeInTheDocument();
  });

  it('shows pending state then transitions to recording', async () => {
    renderPanel(true);

    expect(screen.getByText('Разрешите доступ к микрофону')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });

  it('renders waveform bars after mic access granted', async () => {
    const { container } = renderPanel(true);

    await waitFor(() => {
      expect(container.querySelectorAll('.wave-bar').length).toBe(21);
    });
  });
});
