'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface EditProfileForm {
  name: string;
  bio: string;
  city: string;
}

function getInitial(name: string | null | undefined): string {
  return (name || 'U').charAt(0).toUpperCase();
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileForm>({
    defaultValues: {
      name: '',
      bio: '',
      city: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        bio: profile.bio || '',
        city: profile.city || '',
      });
    } else if (user) {
      reset({
        name: user.displayName || user.name || '',
        bio: '',
        city: '',
      });
    }
  }, [profile, user, reset]);

  const onSubmit = async (data: EditProfileForm) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
        bio: data.bio || undefined,
        city: data.city || undefined,
      });

      updateUser({ displayName: data.name, name: data.name });

      alert(t('profile.profileUpdatedMessage'));
      router.back();
    } catch {
      alert(t('profile.failedUpdate'));
    }
  };

  const avatarUrl = profile?.avatarUrl || user?.avatarUrl;
  const displayName = profile?.name || user?.displayName || user?.name;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col blob-background">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-v2-text-soft hover:text-v2-text mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            {t('wp.back')}
          </button>

          <h1 className="text-2xl font-extrabold text-v2-text mb-6">{t('profile.editProfile')}</h1>

          {profileLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[22px] p-6 shadow-bubble-sm animate-pulse">
                  <div className="h-4 w-20 bg-v2-primary/10 rounded-full mb-3" />
                  <div className="h-12 bg-v2-primary/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar placeholder */}
              <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover shadow-bubble-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-v2-primary/10 flex items-center justify-center text-3xl font-bold text-v2-primary shadow-bubble-xs">
                      {getInitial(displayName)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-v2-text">{t('wp.profilePhoto')}</p>
                    <p className="text-xs text-v2-text-muted">{t('wp.photoComingSoon')}</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
                <label htmlFor="name" className="block text-sm font-semibold text-v2-text mb-2">
                  {t('profile.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                  placeholder={t('profile.enterName')}
                  {...register('name', { required: t('profile.nameRequired') })}
                />
                {errors.name && (
                  <p className="text-xs text-v2-secondary mt-1.5 mr-2">{errors.name.message}</p>
                )}
              </div>

              {/* Bio */}
              <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
                <label htmlFor="bio" className="block text-sm font-semibold text-v2-text mb-2">
                  {t('profile.bio')}
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  className="w-full px-4 py-3 rounded-[16px] bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all resize-none"
                  placeholder={t('profile.placeholderBio')}
                  {...register('bio')}
                />
              </div>

              {/* City */}
              <div className="bg-white rounded-[22px] p-6 shadow-bubble-sm">
                <label htmlFor="city" className="block text-sm font-semibold text-v2-text mb-2">
                  {t('profile.city')}
                </label>
                <input
                  id="city"
                  type="text"
                  className="w-full px-4 py-3 rounded-full bg-v2-bg border-0 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary focus:outline-none transition-all"
                  placeholder={t('wp.currentCity')}
                  {...register('city')}
                />
              </div>

              {/* Save */}
              <button
                type="submit"
                disabled={updateProfile.isPending || !isDirty}
                className="w-full v2-gradient-primary text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-bubble-sm"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('wp.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('profile.saveChanges')}
                  </>
                )}
              </button>
            </form>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
