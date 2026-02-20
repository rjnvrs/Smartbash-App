"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaEllipsisH,
  FaMapMarkerAlt,
  FaTimes,
  FaImage,
  FaUserCircle,
  FaHandsHelping,
} from "react-icons/fa";

type IncidentType = "Fire" | "Flood";
type PostType = "EVENT" | "HELP";

type Post = {
  id: number;
  author: string;
  time: string;
  postType: PostType;
  incidentType: IncidentType;
  location?: string;
  content: string;
  image?: string;
  votes: number;
  userVote: 1 | -1 | 0;
  saved: boolean;
};

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

  /* LOAD PROFILE */
  useEffect(() => {
    const savedImage = localStorage.getItem("residentProfileImage");
    if (savedImage && savedImage !== "null") {
      setProfileImage(savedImage);
    }
  }, []);

  /* LOAD POSTS */
  useEffect(() => {
    const loadPosts = () => {
      const stored = JSON.parse(localStorage.getItem("newsfeed") || "[]");

      const normalized = stored.map((post: any) => ({
        votes: post.votes ?? 0,
        userVote: post.userVote ?? 0,
        saved: post.saved ?? false,
        ...post,
      }));

      setPosts(normalized);
    };

    loadPosts();
    window.addEventListener("focus", loadPosts);
    window.addEventListener("storage", loadPosts);

    return () => {
      window.removeEventListener("focus", loadPosts);
      window.removeEventListener("storage", loadPosts);
    };
  }, []);

  /* IMAGE UPLOAD */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* PUBLISH */
  const handlePublish = () => {
    if (!text.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      author: "Resident",
      time: "Just now",
      postType,
      incidentType,
      location: location || undefined,
      content: text,
      image: image || undefined,
      votes: 0,
      userVote: 0,
      saved: false,
    };

    const existing = JSON.parse(localStorage.getItem("newsfeed") || "[]");
    const updated = [newPost, ...existing];

    localStorage.setItem("newsfeed", JSON.stringify(updated));
    setPosts(updated);

    setText("");
    setImage(null);
    setLocation("");
    setOpenComposer(false);
    setShowChooser(false);
  };

  /* VOTING SYSTEM */
  const handleVote = (id: number, voteType: 1 | -1) => {
    const updated = posts.map((post) => {
      if (post.id !== id) return post;

      let newVotes = post.votes;
      let newUserVote: 1 | -1 | 0 = voteType;

      if (post.userVote === voteType) {
        newVotes -= voteType;
        newUserVote = 0;
      } else {
        newVotes -= post.userVote;
        newVotes += voteType;
      }

      return { ...post, votes: newVotes, userVote: newUserVote };
    });

    setPosts(updated);
    localStorage.setItem("newsfeed", JSON.stringify(updated));
  };

  const toggleSave = (id: number) => {
    const updated = posts.map((post) =>
      post.id === id ? { ...post, saved: !post.saved } : post
    );
    setPosts(updated);
    localStorage.setItem("newsfeed", JSON.stringify(updated));
  };

  const deletePost = (id: number) => {
    const updated = posts.filter((post) => post.id !== id);
    setPosts(updated);
    localStorage.setItem("newsfeed", JSON.stringify(updated));
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">

      {/* WRITE */}
      <div
        onClick={() => setShowChooser(true)}
        className="flex items-center gap-3 bg-white border rounded-full px-4 py-3 cursor-pointer hover:bg-gray-50"
      >
        <img src={profileImage} className="w-10 h-10 rounded-full object-cover" />
        <span className="text-sm text-gray-500">WRITE YOUR STORY</span>
      </div>

      {/* CHOOSER */}
      {showChooser && !openComposer && (
        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-8">

            <div className="border rounded-2xl p-8 text-center flex flex-col justify-between min-h-[260px] hover:shadow-md transition">
              <div>
                <FaMapMarkerAlt className="mx-auto text-green-500 text-4xl" />
                <h3 className="font-semibold mt-6 text-lg">
                  Post Actual Event
                </h3>
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
                <h3 className="font-semibold mt-6 text-lg">
                  Post for Help
                </h3>
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

      {/* HELP MODAL */}
      {openComposer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[820px] rounded-xl shadow-lg">
            <div className="flex justify-between px-6 py-4 border-b">
              <p className="font-semibold text-lg">Post for Help</p>
              <FaTimes
                className="cursor-pointer"
                onClick={() => setOpenComposer(false)}
              />
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setIncidentType("Fire")}
                  className={`px-5 py-2 rounded-full font-medium ${
                    incidentType === "Fire"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  🔥 Fire
                </button>

                <button
                  onClick={() => setIncidentType("Flood")}
                  className={`px-5 py-2 rounded-full font-medium ${
                    incidentType === "Flood"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  🌊 Flood
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

              {image && (
                <img
                  src={image}
                  className="rounded-lg max-h-64 object-cover"
                />
              )}
            </div>

            <div className="flex justify-between px-6 py-4 border-t">
              <label className="cursor-pointer">
                <FaImage />
                <input type="file" hidden onChange={handleImageUpload} />
              </label>

              <button
                onClick={handlePublish}
                className="bg-green-500 text-white px-6 py-2 rounded-lg"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
{/* POSTS */}
{posts.map((post) => (
  <div
    key={post.id}
    className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
  >

    {/* HEADER */}
    <div className="flex justify-between items-start">

      {/* LEFT SIDE */}
      <div className="flex items-start gap-4">

        {/* FIXED AVATAR (NO STRETCH) */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <FaUserCircle className="text-2xl text-gray-600 pointer-events-none" />
        </div>

        {/* TEXT INFO */}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg text-gray-800">
              {post.author}
            </p>

            {post.votes >= 10 && (
              <span className="text-xs font-semibold text-orange-500">
                🔥 Trending
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                post.incidentType === "Fire"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {post.incidentType}
            </span>

            <span className="text-sm text-gray-400">
              {post.time}
            </span>
          </div>

          {post.location && (
            <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
              <FaMapMarkerAlt className="text-xs" />
              {post.location}
            </div>
          )}
        </div>
      </div>

      {/* MENU */}
      <div className="relative">
        <FaEllipsisH
          className="cursor-pointer text-gray-400 hover:text-gray-700 transition"
          onClick={() =>
            setActiveMenu(activeMenu === post.id ? null : post.id)
          }
        />

        {activeMenu === post.id && (
          <div className="absolute right-0 mt-3 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            <button
              onClick={() => {
                toggleSave(post.id);
                setActiveMenu(null);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
            >
              {post.saved ? "Unsave" : "Save"}
            </button>

            <button
              onClick={() => {
                deletePost(post.id);
                setActiveMenu(null);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>

    {/* CONTENT */}
    <div className="mt-5 text-gray-800 text-base leading-relaxed">
      {post.content}
    </div>

    {/* IMAGE */}
    {post.image && (
      <div className="mt-5 rounded-2xl overflow-hidden">
        <img
          src={post.image}
          className="w-full max-h-[500px] object-cover rounded-2xl"
        />
      </div>
    )}

    {/* VOTING */}
    <div className="mt-6 border-t pt-5">
      <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">

        <button
          onClick={() => handleVote(post.id, 1)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
            post.userVote === 1
              ? "bg-green-500 text-white shadow-md"
              : "text-gray-600 hover:text-green-600"
          }`}
        >
          Mark as Urgent
        </button>

        <span className="px-4 font-bold text-gray-700">
          {post.votes}
        </span>

        <button
          onClick={() => handleVote(post.id, -1)}
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