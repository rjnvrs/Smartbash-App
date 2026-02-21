"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaEllipsisH,
  FaMapMarkerAlt,
  FaTimes,
  FaImage,
  FaUserCircle,
  FaHandsHelping,
} from "react-icons/fa";
import { apiFetch } from "@/lib/api";

type IncidentType = "Fire" | "Flood";
type PostType = "EVENT" | "HELP";

type Post = {
  id: number;
  author: string;
  authorEmail?: string;
  authorAvatarUrl?: string;
  time: string;
  postType: PostType;
  incidentType: IncidentType;
  location?: string;
  content: string;
  image?: string;
  votes: number;
  userVote: 1 | -1 | 0;
  urgentCount?: number;
  notUrgentCount?: number;
  saved: boolean;
  canDelete?: boolean;
};

function normalizePost(raw: any): Post {
  const urgentCount = Number(raw?.urgentCount ?? 0);
  const notUrgentCount = Number(raw?.notUrgentCount ?? 0);
  const userVote = raw?.userVote === -1 ? -1 : raw?.userVote === 1 ? 1 : 0;
  return {
    id: Number(raw?.id),
    author: String(raw?.author || "Resident"),
    authorEmail: String(raw?.authorEmail || "").trim().toLowerCase(),
    authorAvatarUrl: raw?.authorAvatarUrl || "",
    time: raw?.time ? new Date(raw.time).toLocaleString() : "Just now",
    postType: raw?.postType === "HELP" ? "HELP" : "EVENT",
    incidentType: raw?.incidentType === "Flood" ? "Flood" : "Fire",
    location: raw?.location || "",
    content: String(raw?.content || ""),
    image: raw?.image || undefined,
    votes: urgentCount - notUrgentCount,
    userVote,
    urgentCount,
    notUrgentCount,
    saved: Boolean(raw?.saved),
    canDelete: Boolean(raw?.canDelete),
  };
}

export default function NewsFeedList() {
  const router = useRouter();

  const defaultProfile =
    "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=111827&size=256";

  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [showChooser, setShowChooser] = useState(false);
  const [openComposer, setOpenComposer] = useState(false);
  const [postType, setPostType] = useState<PostType>("EVENT");
  const [incidentType, setIncidentType] = useState<IncidentType>("Fire");
  const [location, setLocation] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [residentEmail, setResidentEmail] = useState("");

  const loadProfile = async () => {
    try {
      const res = await apiFetch("/auth/residents/profile/", { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const profile = data?.profile || {};
      const name = [profile.firstName, profile.middleName, profile.lastName]
        .filter((v: string) => typeof v === "string" && v.trim().length > 0)
        .join(" ")
        .trim();
      setResidentEmail((profile.email || "").trim().toLowerCase());
      if (profile.avatarUrl) {
        setProfileImage(profile.avatarUrl);
      } else if (name) {
        setProfileImage(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&background=E5E7EB&color=111827&size=256`
        );
      }
    } catch {
      setResidentEmail("");
      setProfileImage(defaultProfile);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await apiFetch("/auth/residents/newsfeed/list/", { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      const normalized = (Array.isArray(data?.posts) ? data.posts : []).map(normalizePost);
      setPosts(normalized);
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    void loadProfile();
    void loadPosts();
    window.addEventListener("focus", loadPosts);
    return () => window.removeEventListener("focus", loadPosts);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!text.trim()) return;
    try {
      const res = await apiFetch("/auth/residents/newsfeed/create/", {
        method: "POST",
        body: JSON.stringify({
          postType,
          incidentType,
          location,
          content: text,
          image: image || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to publish");
      setText("");
      setImage(null);
      setLocation("");
      setOpenComposer(false);
      setShowChooser(false);
      await loadPosts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to publish";
      window.alert(message);
    }
  };

  const handleVote = async (id: number, voteType: 1 | -1) => {
    try {
      await apiFetch("/auth/residents/newsfeed/interest/", {
        method: "POST",
        body: JSON.stringify({ id, voteType: voteType === 1 ? "urgent" : "not_urgent" }),
      });
      await loadPosts();
    } catch {
      // ignore
    }
  };

  const toggleSave = async (id: number) => {
    try {
      await apiFetch("/auth/residents/newsfeed/save/", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
    } catch {
      // ignore
    }
  };

  const deletePost = async (id: number) => {
    try {
      const res = await apiFetch("/auth/residents/newsfeed/delete/", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return;
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  };

  const renderedPosts = useMemo(() => posts, [posts]);

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div
        onClick={() => setShowChooser(true)}
        className="flex items-center gap-3 bg-white border rounded-full px-4 py-3 cursor-pointer hover:bg-gray-50"
      >
        <img src={profileImage} className="w-10 h-10 rounded-full object-cover" alt="profile" />
        <span className="text-sm text-gray-500">WRITE YOUR STORY</span>
      </div>

      {showChooser && !openComposer && (
        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-8">
            <div className="border rounded-2xl p-8 text-center flex flex-col justify-between min-h-[260px] hover:shadow-md transition">
              <div>
                <FaMapMarkerAlt className="mx-auto text-green-500 text-4xl" />
                <h3 className="font-semibold mt-6 text-lg">Post Actual Event</h3>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  Share live photos and location to show what is happening.
                </p>
              </div>
              <button
                className="mt-6 bg-green-500 text-white py-3 rounded-full"
                onClick={() => {
                  setShowChooser(false);
                  router.push("/dashboards/residents");
                }}
              >
                Create Event Post
              </button>
            </div>

            <div className="border rounded-2xl p-8 text-center flex flex-col justify-between min-h-[260px] hover:shadow-md transition">
              <div>
                <FaHandsHelping className="mx-auto text-blue-600 text-4xl" />
                <h3 className="font-semibold mt-6 text-lg">Post for Help</h3>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  Offer or request help for incidents.
                </p>
              </div>
              <button
                className="mt-6 bg-blue-600 text-white py-3 rounded-full"
                onClick={() => {
                  setPostType("HELP");
                  setIncidentType("Fire");
                  setShowChooser(false);
                  setOpenComposer(true);
                }}
              >
                Create Help Post
              </button>
            </div>
          </div>
        </div>
      )}

      {openComposer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[820px] rounded-xl shadow-lg">
            <div className="flex justify-between px-6 py-4 border-b">
              <p className="font-semibold text-lg">Post for Help</p>
              <FaTimes className="cursor-pointer" onClick={() => setOpenComposer(false)} />
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setIncidentType("Fire")}
                  className={`px-5 py-2 rounded-full font-medium ${
                    incidentType === "Fire" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Fire
                </button>

                <button
                  onClick={() => setIncidentType("Flood")}
                  className={`px-5 py-2 rounded-full font-medium ${
                    incidentType === "Flood" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Flood
                </button>
              </div>

              <input
                type="text"
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm"
              />

              <textarea
                placeholder="Write it"
                className="w-full h-40 border rounded-lg p-4 text-sm"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              {image && <img src={image} className="rounded-lg max-h-64 object-cover" alt="preview" />}
            </div>

            <div className="flex justify-between px-6 py-4 border-t">
              <label className="cursor-pointer">
                <FaImage />
                <input type="file" hidden onChange={handleImageUpload} />
              </label>

              <button onClick={() => void handlePublish()} className="bg-green-500 text-white px-6 py-2 rounded-lg">
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {renderedPosts.map((post) => (
        <div key={post.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {post.authorAvatarUrl ? (
                  <img src={post.authorAvatarUrl} alt={post.author} className="w-12 h-12 object-cover" />
                ) : (
                  <FaUserCircle className="text-2xl text-gray-600 pointer-events-none" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg text-gray-800">{post.author}</p>
                  {post.votes >= 1 && <span className="text-xs font-semibold text-orange-500">Trending</span>}
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      post.incidentType === "Fire" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {post.incidentType}
                  </span>

                  <span className="text-sm text-gray-400">{post.time}</span>
                </div>

                {post.location && (
                  <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                    <FaMapMarkerAlt className="text-xs" />
                    {post.location}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <FaEllipsisH
                className="cursor-pointer text-gray-400 hover:text-gray-700 transition"
                onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
              />

              {activeMenu === post.id && (
                <div className="absolute right-0 mt-3 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      void toggleSave(post.id);
                      setActiveMenu(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    {post.saved ? "Unsave" : "Save"}
                  </button>

                  {(post.canDelete || post.authorEmail === residentEmail) && (
                    <button
                      onClick={() => {
                        void deletePost(post.id);
                        setActiveMenu(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 text-gray-800 text-base leading-relaxed">{post.content}</div>

          {post.image && (
            <div className="mt-5 rounded-2xl overflow-hidden">
              <img src={post.image} className="w-full max-h-[500px] object-cover rounded-2xl" alt="post" />
            </div>
          )}

          <div className="mt-6 border-t pt-5">
            <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
              <button
                onClick={() => void handleVote(post.id, 1)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  post.userVote === 1
                    ? "bg-green-500 text-white shadow-md"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                Mark as Urgent
              </button>

              <span className="px-4 font-bold text-gray-700">{post.votes}</span>

              <button
                onClick={() => void handleVote(post.id, -1)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  post.userVote === -1
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Not Urgent
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
