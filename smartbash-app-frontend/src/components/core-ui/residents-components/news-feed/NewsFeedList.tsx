"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaEllipsisH,
  FaRegComment,
  FaShare,
  FaMapMarkerAlt,
  FaTimes,
  FaImage,
  FaUserCircle,
} from "react-icons/fa";
import { apiFetch } from "@/lib/api";

type IncidentType = "Fire" | "Flood";
type PostType = "EVENT" | "HELP";

type Post = {
  id: number;
  author: string;
  authorEmail?: string;
  time: string;
  postType: PostType;
  incidentType: IncidentType;
  location?: string;
  content: string;
  image?: string;
  interested: boolean;
  saved: boolean;
  comments?: Array<{
    id: number;
    author: string;
    authorEmail?: string;
    content: string;
    createdAt: string;
  }>;
  commentCount?: number;
  shareCount?: number;
  canDelete?: boolean;
};

type DraftsByPost = Record<number, string>;

export default function NewsFeedList() {
  const [profileImage, setProfileImage] = useState("");
  const [residentName, setResidentName] = useState("Resident");
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(null);
  const [commentDraftByPost, setCommentDraftByPost] = useState<DraftsByPost>({});

  const [showChooser, setShowChooser] = useState(false);
  const [openComposer, setOpenComposer] = useState(false);

  const [postType, setPostType] = useState<PostType>("EVENT");
  const [incidentType, setIncidentType] = useState<IncidentType>("Fire");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [residentEmail, setResidentEmail] = useState("");
  const fallbackProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    residentName || "Resident"
  )}&background=E5E7EB&color=111827&size=256`;

  const menuRef = useRef<HTMLDivElement | null>(null);

  const loadProfileImage = async () => {
    try {
      const res = await apiFetch("/auth/residents/profile/", { method: "GET" });
      const data = await res.json();
      if (!res.ok) return;
      const profile = data?.profile || {};
      const fullName = `${profile.firstName || ""} ${profile.middleName || ""} ${
        profile.lastName || ""
      }`
        .replace(/\s+/g, " ")
        .trim();
      setResidentName(fullName || "Resident");
      const email = (profile.email || "").trim().toLowerCase();
      setResidentEmail(email);
      const key = email ? `residentProfileImage:${email}` : "residentProfileImage";
      const saved = localStorage.getItem(key);
      if (saved && saved !== "null") setProfileImage(saved);
      else setProfileImage("");
    } catch {
      setProfileImage("");
      setResidentName("Resident");
    }
  };

  const loadPosts = async () => {
    try {
      const res = await apiFetch("/auth/residents/newsfeed/list/", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load posts");
      setPosts((data?.posts || []) as Post[]);
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    loadProfileImage();
    loadPosts();
    window.addEventListener("profileUpdated", loadProfileImage);
    return () => window.removeEventListener("profileUpdated", loadProfileImage);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!text.trim() && !image) return;
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to publish");

      setText("");
      setImage(null);
      setLocation("");
      setIncidentType("Fire");
      setShowLocationInput(false);
      setOpenComposer(false);
      setShowChooser(false);
      await loadPosts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to publish";
      window.alert(message);
    }
  };

  const toggleInterested = async (id: number) => {
    await apiFetch("/auth/residents/newsfeed/interest/", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    setActiveMenu(null);
    await loadPosts();
  };

  const toggleSaved = async (id: number) => {
    await apiFetch("/auth/residents/newsfeed/save/", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    setActiveMenu(null);
    await loadPosts();
  };

  const deletePost = async (id: number) => {
    const res = await apiFetch("/auth/residents/newsfeed/delete/", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data?.message || "Failed to delete post");
      return;
    }
    setActiveMenu(null);
    await loadPosts();
  };

  const toggleComments = (postId: number) => {
    setOpenCommentsPostId((prev) => (prev === postId ? null : postId))
  }

  const submitComment = async (postId: number) => {
    const draft = (commentDraftByPost[postId] || "").trim()
    if (!draft) return

    try {
      const res = await apiFetch("/auth/residents/newsfeed/comment/", {
        method: "POST",
        body: JSON.stringify({ id: postId, content: draft }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to comment")

      setCommentDraftByPost((prev) => ({ ...prev, [postId]: "" }))
      await loadPosts()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to comment"
      window.alert(message)
    }
  }

  const handleShare = async (post: Post) => {
    const shareUrl = `${window.location.origin}/dashboards/residents/news-feed?post=${post.id}`
    const shareText = `${post.incidentType} alert: ${post.content || "Incident post"}`

    let shared = false
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Smartbash Post",
          text: shareText,
          url: shareUrl,
        })
        shared = true
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        window.alert("Post link copied.")
        shared = true
      } else {
        window.prompt("Copy link:", shareUrl)
        shared = true
      }
    } catch {
      // user cancelled share dialog
    }

    if (!shared) return
    try {
      await apiFetch("/auth/residents/newsfeed/share/", {
        method: "POST",
        body: JSON.stringify({ id: post.id }),
      })
      await loadPosts()
    } catch {
      // ignore share count update errors
    }
  }

  const renderedPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        timeLabel: post.time ? new Date(post.time).toLocaleString() : "",
      })),
    [posts]
  );

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div
        onClick={() => setShowChooser(true)}
        className="flex items-center gap-3 bg-white border rounded-full px-4 py-3 cursor-pointer hover:bg-gray-50"
      >
        <img src={profileImage || fallbackProfile} className="w-10 h-10 rounded-full object-cover" alt="profile" />
        <span className="text-sm text-gray-500">WRITE YOUR STORY</span>
      </div>

      {showChooser && !openComposer && (
        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-8">
            <div className="border rounded-2xl p-8 text-center">
              <FaMapMarkerAlt className="mx-auto text-green-500 text-3xl" />
              <h3 className="font-semibold mt-4">Post Actual Event</h3>
              <p className="text-sm text-gray-500 mt-2">
                Share live photos and location in real time.
              </p>
              <button
                className="mt-6 bg-green-500 text-white py-3 rounded-full w-full"
                onClick={() => {
                  setPostType("EVENT");
                  setIncidentType("Fire");
                  setShowChooser(false);
                  setOpenComposer(true);
                }}
              >
                Create Event Post
              </button>
            </div>

            <div className="border rounded-2xl p-8 text-center">
              <div className="mx-auto text-blue-500 text-3xl">?</div>
              <h3 className="font-semibold mt-4">Post for Help</h3>
              <p className="text-sm text-gray-500 mt-2">
                Use this if you want to help from afar.
              </p>
              <button
                className="mt-6 bg-blue-600 text-white py-3 rounded-full w-full"
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
              <p className="font-semibold">
                {postType === "HELP" ? "Post for Help" : "Post Actual Event"}
              </p>
              <FaTimes className="cursor-pointer" onClick={() => setOpenComposer(false)} />
            </div>

            <div className="px-6 py-4 space-y-4">
              <textarea
                placeholder="Write it"
                className="w-full h-40 border rounded-lg p-4 text-sm"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              {showLocationInput && (
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                  <FaMapMarkerAlt />
                  <input
                    className="flex-1 outline-none text-sm"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              )}

              {image && <img src={image} className="rounded-lg max-h-64 object-cover" alt="preview" />}
            </div>

            <div className="flex justify-between px-6 py-4 border-t">
              <div className="flex gap-4 items-center">
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                  className={`border rounded-lg px-3 py-1 text-sm ${
                    incidentType === "Fire" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <option value="Fire">Fire</option>
                  <option value="Flood">Flood</option>
                </select>

                <label className="cursor-pointer">
                  <FaImage />
                  <input type="file" hidden onChange={handleImageUpload} />
                </label>

                <FaMapMarkerAlt className="cursor-pointer" onClick={() => setShowLocationInput(!showLocationInput)} />
              </div>

              <button onClick={handlePublish} className="bg-green-500 text-white px-6 py-2 rounded-lg">
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {renderedPosts.map((post) => (
        <div key={post.id} className="bg-white border rounded-xl shadow-sm">
          <div className="flex justify-between p-4">
            <div className="flex gap-3">
              <FaUserCircle className="text-3xl text-gray-400" />
              <div>
                <p className="font-semibold text-sm">{post.author}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className={`px-2 rounded-full ${post.incidentType === "Fire" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                    {post.incidentType}
                  </span>
                  <span>- {post.timeLabel}</span>
                </div>
                {post.location && (
                  <p className="text-xs text-gray-500 flex gap-1 mt-1">
                    <FaMapMarkerAlt /> {post.location}
                  </p>
                )}
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <FaEllipsisH className="cursor-pointer text-gray-400" onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)} />
              {activeMenu === post.id && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg">
                  <button onClick={() => toggleInterested(post.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                    {post.interested ? "Interested" : "Mark Interested"}
                  </button>
                  <button onClick={() => toggleSaved(post.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                    {post.saved ? "Saved" : "Save Post"}
                  </button>
                  {(post.canDelete || post.authorEmail === residentEmail) && (
                    <button onClick={() => deletePost(post.id)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                      Delete Post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 text-sm">{post.content}</div>
          {post.image && <img src={post.image} className="w-full mt-3 rounded-b-xl" alt="post" />}

          <div className="flex justify-between px-6 py-3 border-t text-sm text-gray-600">
            <button className="flex items-center gap-2" onClick={() => toggleComments(post.id)}>
              <FaRegComment /> Comment
              <span className="text-xs text-gray-500">{post.commentCount || 0}</span>
            </button>
            <button className="flex items-center gap-2" onClick={() => handleShare(post)}>
              <FaShare /> Share
              <span className="text-xs text-gray-500">{post.shareCount || 0}</span>
            </button>
          </div>

          {openCommentsPostId === post.id && (
            <div className="px-4 pb-4 border-t">
              <div className="space-y-2 py-3 max-h-48 overflow-auto">
                {(post.comments || []).length === 0 ? (
                  <p className="text-xs text-gray-500">No comments yet.</p>
                ) : (
                  (post.comments || []).map((comment) => (
                    <div key={comment.id} className="text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <p className="font-medium">{comment.author}</p>
                      <p>{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={commentDraftByPost[post.id] || ""}
                  onChange={(e) =>
                    setCommentDraftByPost((prev) => ({ ...prev, [post.id]: e.target.value }))
                  }
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Write a comment..."
                />
                <button
                  type="button"
                  onClick={() => submitComment(post.id)}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
