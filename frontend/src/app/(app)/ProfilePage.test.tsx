import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfilePage } from './ProfilePage';
import * as useRecordsModule from '@/hooks/useRecords';
import * as useProfileModule from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/auth.store';
import { userService } from '@/services/user.service';

vi.mock('@/hooks/useRecords');
vi.mock('@/hooks/useProfile');
vi.mock('@/services/user.service', () => ({
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProfileModule.useProfile).mockReturnValue({
      data: { id: 1, email: 'test@example.com', name: 'Test User', bio: 'Hello world', followers_count: 0, following_count: 0, records_count: 2 },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProfileModule.useProfile>);
    vi.mocked(useRecordsModule.useRecords).mockReturnValue({
      data: [
        { id: 1, title: 'Rec 1', duration: 3600, user_id: 1, file_path: '/f', created_at: '', is_public: false, hearts_count: 0, broken_hearts_count: 0, comments_count: 0, user_reaction: 0, is_following: false },
        { id: 2, title: 'Rec 2', duration: 1800, user_id: 1, file_path: '/f', created_at: '', is_public: false, hearts_count: 0, broken_hearts_count: 0, comments_count: 0, user_reaction: 0, is_following: false },
      ],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRecordsModule.useRecords>);
  });

  it('renders header', () => {
    renderPage();
    expect(screen.getByText('Профиль')).toBeInTheDocument();
    expect(screen.getByText('Настройки аккаунта')).toBeInTheDocument();
  });

  it('renders user info from profile API', () => {
    renderPage();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useProfileModule.useProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useProfileModule.useProfile>);

    renderPage();
    expect(screen.queryByText('Профиль')).not.toBeInTheDocument();
  });

  it('renders stats from records', () => {
    renderPage();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('01:30:00')).toBeInTheDocument();
  });

  it('renders logout button and navigates on click', async () => {
    const user = userEvent.setup();
    const logoutSpy = vi.fn();
    useAuthStore.setState({ logout: logoutSpy });

    renderPage();

    const logoutBtn = screen.getByText('Выйти из аккаунта');
    expect(logoutBtn).toBeInTheDocument();

    await user.click(logoutBtn);

    expect(logoutSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('does not show delete account button', () => {
    renderPage();
    expect(screen.queryByText('Удалить аккаунт')).not.toBeInTheDocument();
  });

  it('shows Изменить пароль button in account section', () => {
    renderPage();
    expect(screen.getByText('Изменить пароль')).toBeInTheDocument();
  });

  it('reveals password form when Изменить пароль is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Изменить пароль'));

    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(3);
    expect(screen.getByText('Сохранить новый пароль')).toBeInTheDocument();
    expect(screen.getByText('Отмена')).toBeInTheDocument();
  });

  it('disables submit button when passwords do not match', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Изменить пароль'));

    const inputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(inputs[0], 'oldpass');
    await user.type(inputs[1], 'newpass1');
    await user.type(inputs[2], 'newpass2');

    expect(screen.getByText('Сохранить новый пароль')).toBeDisabled();
  });

  it('enables submit button when passwords match and all fields filled', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Изменить пароль'));

    const inputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(inputs[0], 'oldpass');
    await user.type(inputs[1], 'newpass');
    await user.type(inputs[2], 'newpass');

    expect(screen.getByText('Сохранить новый пароль')).not.toBeDisabled();
  });

  it('calls changePassword and hides form on success', async () => {
    vi.mocked(userService.changePassword).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Изменить пароль'));

    const inputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(inputs[0], 'oldpass');
    await user.type(inputs[1], 'newpass');
    await user.type(inputs[2], 'newpass');

    await user.click(screen.getByText('Сохранить новый пароль'));

    expect(userService.changePassword).toHaveBeenCalledWith('oldpass', 'newpass');
    await waitFor(() => {
      expect(screen.getByText('Изменить пароль')).toBeInTheDocument();
      expect(screen.queryByText('Сохранить новый пароль')).not.toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(new Error('bad request'));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Изменить пароль'));

    const inputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(inputs[0], 'oldpass');
    await user.type(inputs[1], 'newpass');
    await user.type(inputs[2], 'newpass');

    await user.click(screen.getByText('Сохранить новый пароль'));

    await waitFor(() => {
      expect(screen.getByText('Не удалось изменить пароль. Проверьте текущий пароль.')).toBeInTheDocument();
    });
    expect(screen.getByText('Сохранить новый пароль')).toBeInTheDocument();
  });

  it('hides form and clears fields on cancel', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Изменить пароль'));

    const inputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(inputs[0], 'somepass');

    await user.click(screen.getByText('Отмена'));

    expect(screen.getByText('Изменить пароль')).toBeInTheDocument();
    expect(screen.queryByText('Сохранить новый пароль')).not.toBeInTheDocument();
  });
});
