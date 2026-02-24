import { createClient } from '@/lib/supabase/server';
import ChatListClient from './ChatListClient';

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <ChatListClient user={user} />;
}
