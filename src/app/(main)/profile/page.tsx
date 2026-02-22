import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h1 className="font-heading text-2xl font-light text-gold-1 tracking-wide">
          Profil
        </h1>
      </div>

      {/* Profile Card */}
      <div className="bg-dark rounded-2xl border border-gold-1/10 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gold-1/15 border border-gold-1/20 flex items-center justify-center text-gold-1 font-heading text-2xl">
            {user?.email?.slice(0, 1).toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-[#F0EDE8] font-body font-medium">
              {user?.email ?? 'Gast'}
            </p>
            <p className="text-[#5A5450] text-sm font-label uppercase tracking-widest text-[10px] mt-1">
              Soul Spark · VIP 1
            </p>
          </div>
        </div>

        {/* Placeholder Info */}
        <div className="border-t border-gold-1/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#5A5450] text-sm font-label uppercase tracking-wider text-[10px]">Seeds</span>
            <span className="text-gold-1 font-body">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5A5450] text-sm font-label uppercase tracking-wider text-[10px]">Mitglied seit</span>
            <span className="text-[#9A9080] font-body text-sm">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
                : '–'}
            </span>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="mt-6 text-center py-8 border border-dashed border-gold-1/15 rounded-2xl">
        <p className="text-gold-3 font-heading text-lg font-light">
          Mehr kommt bald
        </p>
        <p className="text-[#5A5450] text-sm mt-1">
          Bio, Avatar, Seeds-Verlauf, Einstellungen …
        </p>
      </div>
    </>
  );
}
