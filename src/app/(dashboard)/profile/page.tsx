"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, MessageSquare, ImageIcon, Crown, Calendar, Edit2, Save, X, RotateCw, LogOut, Shield } from "lucide-react";
import { useUsage } from "@/components/layout/Sidebar";

const BOY_AVATARS = Array.from({ length: 20 }, (_, i) => `boy${i + 1}`);
const GIRL_AVATARS = Array.from({ length: 20 }, (_, i) => `girl${i + 1}`);

export default function ProfilePage() {
  const router = useRouter();
  const { user, isPremium, logout } = useUsage();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarType, setAvatarType] = useState<"boy" | "girl">("boy");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    username: user?.username || "User",
    email: user?.email || "",
    bio: "No bio available.",
    profilePicture: user?.profile_picture || `https://api.dicebear.com/7.x/lorelei/svg?seed=boy1`,
    joinedAt: new Date().toLocaleDateString(),
    userId: "AM-000000",
    // Social links
    website: "",
    tiktok: "",
    facebook: "",
  });

  const [socialLinks, setSocialLinks] = useState({
    website: "",
    tiktok: "",
    facebook: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) router.push("/login");
    else {
      const userData = JSON.parse(stored);
      setProfile({
        username: userData.username || "User",
        email: userData.email || "",
        bio: userData.bio || "No bio available.",
        profilePicture: userData.profile_picture || `https://api.dicebear.com/7.x/lorelei/svg?seed=boy1`,
        joinedAt: userData.created_at || new Date().toLocaleDateString(),
        userId: userData.id || "AM-000000",
        website: userData.website || "",
        tiktok: userData.tiktok || "",
        facebook: userData.facebook || "",
      });
      setSocialLinks({
        website: userData.website || "",
        tiktok: userData.tiktok || "",
        facebook: userData.facebook || "",
      });
    }
    setLoading(false);
  }, [router]);

  const rotateAvatar = () => {
    const nextIndex = (avatarIndex + 1) % 20;
    setAvatarIndex(nextIndex);
    const seed = avatarType === "boy" ? BOY_AVATARS[nextIndex] : GIRL_AVATARS[nextIndex];
    const newAvatar = `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`;
    setProfile({ ...profile, profilePicture: newAvatar });
  };

  const toggleAvatarType = () => {
    const newType = avatarType === "boy" ? "girl" : "boy";
    setAvatarType(newType);
    setAvatarIndex(0);
    const seed = newType === "boy" ? BOY_AVATARS[0] : GIRL_AVATARS[0];
    setProfile({ ...profile, profilePicture: `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}` });
  };

  const handleSave = () => {
    setIsSaving(true);
    // Save to localStorage (in real app, would save to API)
    const stored = localStorage.getItem("user");
    if (stored) {
      const userData = JSON.parse(stored);
      userData.username = profile.username;
      userData.bio = profile.bio;
      userData.profile_picture = profile.profilePicture;
      userData.website = socialLinks.website;
      userData.tiktok = socialLinks.tiktok;
      userData.facebook = socialLinks.facebook;
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setTimeout(() => {
      setIsEditing(false);
      setIsSaving(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-950">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-8">

        {/* Header with Avatar */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-xl shadow-orange-500/20 overflow-hidden">
              <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {isEditing && (
              <div className="absolute bottom-0 right-0 flex gap-1 mt-2">
                <button onClick={rotateAvatar} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all" title="Rotate Avatar">
                  <RotateCw size={16} />
                </button>
                <button onClick={toggleAvatarType} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all" title="Switch Gender">
                  <User size={16} />
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="text-center text-2xl font-extrabold bg-transparent border-b border-zinc-700 text-white focus:outline-none focus:border-orange-500"
            />
          ) : (
            <h2 className="text-3xl font-extrabold text-white">{profile.username}</h2>
          )}
          
          <p className="text-zinc-500">{profile.email}</p>
          <div className="flex items-center justify-center gap-3">
            {isPremium && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 text-orange-500 rounded-full text-sm font-bold uppercase">
                <Crown size={14} /> Premium
              </span>
            )}
            <span className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-500">
              <Calendar size={12} /> {profile.joinedAt}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <MessageSquare size={24} className="mx-auto mb-2 text-zinc-500" />
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-zinc-500 uppercase">Chats</div>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <ImageIcon size={24} className="mx-auto mb-2 text-zinc-500" />
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-zinc-500 uppercase">Images</div>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <Shield size={24} className="mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-orange-500">{isPremium ? "Pro" : "Free"}</div>
            <div className="text-xs text-zinc-500 uppercase">Plan</div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">About Me</h3>
            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-all">
              {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
            </button>
          </div>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 resize-none h-24"
              placeholder="သင့်အကြောင်း ရေးပါ..."
            />
          ) : (
            <p className="text-zinc-400">{profile.bio}</p>
          )}
        </div>

        {/* Social Links Section */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">ဆိုင်းလင့်ခ်</h3>
            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-all">
              {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
            </button>
          </div>
          <div className="space-y-3">
            {/* Website */}
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
              <span className="text-xl">🌐</span>
              {isEditing ? (
                <input
                  type="url"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 bg-transparent text-zinc-300 focus:outline-none"
                />
              ) : socialLinks.website ? (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex-1 text-orange-400 hover:text-orange-300 truncate">
                  {socialLinks.website}
                </a>
              ) : (
                <span className="flex-1 text-zinc-600">မထည်သွင်းပါ</span>
              )}
            </div>
            {/* TikTok */}
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
              <span className="text-xl">🎵</span>
              {isEditing ? (
                <input
                  type="text"
                  value={socialLinks.tiktok}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  placeholder="@yourtiktok"
                  className="flex-1 bg-transparent text-zinc-300 focus:outline-none"
                />
              ) : socialLinks.tiktok ? (
                <a href={`https://tiktok.com/@${socialLinks.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-orange-400 hover:text-orange-300 truncate">
                  @{socialLinks.tiktok.replace('@', '')}
                </a>
              ) : (
                <span className="flex-1 text-zinc-600">မထည်သွင်းပါ</span>
              )}
            </div>
            {/* Facebook */}
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
              <span className="text-xl">📘</span>
              {isEditing ? (
                <input
                  type="text"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  placeholder="facebook.com/yourprofile"
                  className="flex-1 bg-transparent text-zinc-300 focus:outline-none"
                />
              ) : socialLinks.facebook ? (
                <a href={`https://facebook.com/${socialLinks.facebook.replace('facebook.com/', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-orange-400 hover:text-orange-300 truncate">
                  {socialLinks.facebook}
                </a>
              ) : (
                <span className="flex-1 text-zinc-600">မထည်သွင်းပါ</span>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-lg">Account Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
              <User size={18} className="text-zinc-500" />
              <span className="text-zinc-300">{profile.username}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
              <Mail size={18} className="text-zinc-500" />
              <span className="text-zinc-300">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
              <Shield size={18} className="text-zinc-500" />
              <span className="text-zinc-300">ID: {profile.userId}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-all">
          <LogOut size={18} />
          <span className="font-bold">Logout</span>
        </button>

      </div>
    </div>
  );
}
