import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { useProfile } from "@/hooks/useProfile";
import { useRecords } from "@/hooks/useRecords";
import { userService } from "@/services/user.service";
import { RecordStats } from "@/components/record";
import { API_URL } from "@/utils/constants";
import { cn } from "@/utils/cn";

const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/;
const CYRILLIC_RE = /[а-яА-ЯёЁ]/;

export function ProfilePage() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  const { data: records } = useRecords();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const baseUrl = new URL(API_URL).origin;

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  const hasChanges =
    name !== (profile?.name ?? "") ||
    bio !== (profile?.bio ?? "") ||
    avatar !== null;

  async function handleSave() {
    setIsSaving(true);
    try {
      await userService.updateProfile({
        name,
        bio,
        avatar: avatar ?? undefined,
      });
      setAvatar(null);
      setAvatarPreview(null);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } finally {
      setIsSaving(false);
    }
  }

  const totalSeconds = useMemo(
    () => (records ?? []).reduce((sum, r) => sum + r.duration, 0),
    [records],
  );

  async function handleChangePassword() {
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (CYRILLIC_RE.test(newPassword)) {
      setPasswordError("Пароль не должен содержать кириллицу");
      return;
    }
    if (!PASSWORD_RE.test(newPassword)) {
      setPasswordError("Пароль должен содержать латиницу, цифры, заглавную букву и спецсимвол");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Не удалось изменить пароль. Проверьте текущий пароль.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Icon
          icon="solar:refresh-bold"
          className="animate-spin text-2xl text-neutral-300"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-neutral-900 mb-1">
          Профиль
        </h2>
        <p className="text-sm text-neutral-400">Настройки аккаунта</p>
      </div>

      {/* Stats */}
      <RecordStats count={records?.length ?? 0} totalSeconds={totalSeconds} />

      {/* User Info Card */}
      <div className="rounded-[20px] border border-[#f0f0f0] bg-white p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden"
          >
            {avatarPreview || profile?.avatar_url ? (
              <img
                src={avatarPreview ?? `${baseUrl}${profile!.avatar_url}`}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon
                icon="solar:user-bold"
                className="text-3xl text-brand-600"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <Icon icon="solar:camera-bold" className="text-lg text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarPick}
          />
          <div className="flex-1">
            <p className="text-lg font-bold text-neutral-900">
              {profile?.email}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[14px] border-[1.5px] border-[#f0f0f0] bg-[#fafafa] px-4 py-3.5 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-500/[0.08]"
              placeholder="Ваше имя"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              О себе
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-[14px] border-[1.5px] border-[#f0f0f0] bg-[#fafafa] px-4 py-3.5 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-500/[0.08]"
              placeholder="Расскажите о себе"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
            >
              {isSaving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>

      {/* Account section */}
      <div className="rounded-[20px] border border-[#f0f0f0] p-6 mb-4">
        <h3 className="mb-3 text-sm font-bold text-neutral-900">
          Учётная запись
        </h3>
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="text-xs font-semibold text-brand-500 transition-colors hover:text-brand-600"
          >
            Изменить пароль
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Текущий пароль
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-[14px] border-[1.5px] border-[#f0f0f0] bg-white py-3 pl-4 pr-12 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/[0.08]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  <Icon icon={showCurrentPassword ? "solar:eye-closed-bold" : "solar:eye-bold"} className="text-lg" />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Новый пароль
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-[14px] border-[1.5px] border-[#f0f0f0] bg-white py-3 pl-4 pr-12 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/[0.08]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  <Icon icon={showNewPassword ? "solar:eye-closed-bold" : "solar:eye-bold"} className="text-lg" />
                </button>
              </div>

              {/* Requirements checklist */}
              <div className="mt-3 space-y-1.5 rounded-xl bg-[#fafafa] p-3 border border-[#f0f0f0]">
                <div className={cn("flex items-center gap-2 text-[10px]", newPassword.length >= 6 ? "text-green-600" : "text-neutral-400")}>
                  <Icon icon={newPassword.length >= 6 ? "solar:check-read-linear" : "solar:round-transfer-vertical-linear"} />
                  <span>Минимум 6 символов</span>
                </div>
                <div className={cn("flex items-center gap-2 text-[10px]", (/[A-Z]/.test(newPassword) && !CYRILLIC_RE.test(newPassword)) ? "text-green-600" : "text-neutral-400")}>
                  <Icon icon={(/[A-Z]/.test(newPassword) && !CYRILLIC_RE.test(newPassword)) ? "solar:check-read-linear" : "solar:round-transfer-vertical-linear"} />
                  <span>Заглавная латинская буква</span>
                </div>
                <div className={cn("flex items-center gap-2 text-[10px]", /\d/.test(newPassword) ? "text-green-600" : "text-neutral-400")}>
                  <Icon icon={/\d/.test(newPassword) ? "solar:check-read-linear" : "solar:round-transfer-vertical-linear"} />
                  <span>Минимум одна цифра</span>
                </div>
                <div className={cn("flex items-center gap-2 text-[10px]", /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "text-green-600" : "text-neutral-400")}>
                  <Icon icon={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "solar:check-read-linear" : "solar:round-transfer-vertical-linear"} />
                  <span>Специальный символ</span>
                </div>
                <div className={cn("flex items-center gap-2 text-[10px]", (newPassword.length > 0 && !CYRILLIC_RE.test(newPassword)) ? "text-green-600" : newPassword.length > 0 ? "text-red-500" : "text-neutral-400")}>
                  <Icon icon={(newPassword.length > 0 && !CYRILLIC_RE.test(newPassword)) ? "solar:check-read-linear" : "solar:round-transfer-vertical-linear"} />
                  <span>Только латиница</span>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Повторить пароль
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-[14px] border-[1.5px] border-[#f0f0f0] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/[0.08]"
                placeholder="••••••••"
              />
            </div>
            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError(null);
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                }}
                className="rounded-xl border-[1.5px] border-[#e5e5e5] px-5 py-2.5 text-xs font-semibold text-neutral-500 transition-all hover:border-[#d4d4d4] hover:bg-[#fafafa]"
              >
                Отмена
              </button>
              <button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  newPassword !== confirmPassword
                }
                className="btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
              >
                {isChangingPassword
                  ? "Сохранение..."
                  : "Сохранить новый пароль"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="text-center mt-10">
        <button
          onClick={handleLogout}
          className="rounded-xl border-[1.5px] border-[#e5e5e5] px-5 py-2.5 text-xs font-semibold text-red-500 transition-all hover:border-red-300 hover:bg-red-50"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
