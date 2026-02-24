import { createClient } from '@/lib/supabase/server';
import ChatRoomClient from './ChatRoomClient';

interface Props {
  params: Promise<{ channelId: string }>;
}

export default async function ChatRoomPage({ params }: Props) {
  const { channelId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <ChatRoomClient channelId={channelId} user={user} />;
}
