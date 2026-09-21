import { useState } from "react";

export function UserAvatar({ user, className = "size-8" }: {
  user: { id: string; name: string; username?: string | null; image?: string | null };
  className?: string;
}) {
  const [failedImage, setFailedImage] = useState<string>();
  const fallback = `https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(user.username || user.id)}`;
  const src = user.image && failedImage !== user.image ? user.image : fallback;
  return <img src={src} alt={`${user.name}'s avatar`} className={`${className} rounded-full bg-muted object-cover`} referrerPolicy="no-referrer" onError={() => setFailedImage(src)} />;
}
