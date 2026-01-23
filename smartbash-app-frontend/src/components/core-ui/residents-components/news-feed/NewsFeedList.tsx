"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaEllipsisH,
  FaRegComment,
  FaShare,
  FaMapMarkerAlt,
  FaTimes,
  FaImage,
  FaUserCircle,
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
  interested: boolean;
  saved: boolean;
};

export default function NewsFeedList() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [showChooser, setShowChooser] = useState(false);
  const [openComposer, setOpenComposer] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [postType, setPostType] = useState<PostType>("EVENT");
  const [incidentType, setIncidentType] = useState<IncidentType>("Fire");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);

  /* CLOSE MENU */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
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
    if (!text && !image) return;

    const newPost: Post = {
      id: Date.now(),
      author: "Mikaylgoan@gmail.com",
      time: "Just now",
      postType,
      incidentType,
      location: location || undefined,
      content: text,
      image: image || undefined,
      interested: false,
      saved: false,
    };

    setPosts([newPost, ...posts]);

    setText("");
    setImage(null);
    setLocation("");
    setIncidentType("Fire");
    setShowLocationInput(false);
    setOpenComposer(false);
    setShowChooser(false);
  };

  const toggleInterested = (id: number) => {
    setPosts((p) =>
      p.map((x) =>
        x.id === id ? { ...x, interested: !x.interested } : x
      )
    );
    setActiveMenu(null);
  };

  const toggleSaved = (id: number) => {
    setPosts((p) =>
      p.map((x) =>
        x.id === id ? { ...x, saved: !x.saved } : x
      )
    );
    setActiveMenu(null);
  };

  const deletePost = (id: number) => {
    setPosts((p) => p.filter((x) => x.id !== id));
    setActiveMenu(null);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">

      {/* WRITE YOUR STORY */}
      <div
        onClick={() => setShowChooser(true)}
        className="flex items-center gap-3 bg-white border rounded-full px-4 py-3 cursor-pointer hover:bg-gray-50"
      >
        <FaUserCircle className="text-3xl text-gray-400" />
        <span className="text-sm text-gray-500">WRITE YOUR STORY</span>
      </div>

      {/* CHOOSER */}
      {showChooser && !openComposer && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-6">

            <div className="border rounded-xl p-6 flex flex-col text-center">
              <FaMapMarkerAlt className="mx-auto text-green-500 text-3xl" />
              <h3 className="font-semibold mt-4">Post Actual Event</h3>
              <p className="text-sm text-gray-500 mt-2">
                Share live photos and location in real time.
              </p>
              <button
                className="mt-auto bg-green-500 text-white py-2 rounded-full w-full"
                onClick={() => {
                  setPostType("EVENT");
                  setOpenComposer(true);
                  router.push("/dashboards/residents"); // 🚀 NAVIGATION ADDED
                }}
              >
                Create Event Post
              </button>
            </div>

            <div className="border rounded-xl p-6 flex flex-col text-center">
              <div className="mx-auto text-blue-500 text-3xl">?</div>
              <h3 className="font-semibold mt-4">Post for Help</h3>
              <p className="text-sm text-gray-500 mt-2">
                Use this if you want to help from afar.
              </p>
              <button
                className="mt-auto bg-blue-600 text-white py-2 rounded-full w-full"
                onClick={() => {
                  setPostType("HELP");
                  setOpenComposer(true);
                }}
              >
                Create Help Post
              </button>
            </div>

          </div>
        </div>
      )}

      {/* COMPOSER */}
      {openComposer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[820px] rounded-xl shadow-lg">

            <div className="flex justify-between px-6 py-4 border-b">
              <p className="font-semibold">
                {postType === "EVENT" ? "Post Actual Event" : "Post for Help"}
              </p>
              <FaTimes
                className="cursor-pointer"
                onClick={() => {
                  setOpenComposer(false);
                  setShowChooser(false);
                }}
              />
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

              {image && (
                <img src={image} className="rounded-lg max-h-64 object-cover" />
              )}
            </div>

            <div className="flex justify-between px-6 py-4 border-t">
              <div className="flex gap-4 items-center">
                <select
                  value={incidentType}
                  onChange={(e) =>
                    setIncidentType(e.target.value as IncidentType)
                  }
                  className={`border rounded-lg px-3 py-1 text-sm ${
                    incidentType === "Fire"
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <option value="Fire">Fire</option>
                  <option value="Flood">Flood</option>
                </select>

                <label className="cursor-pointer">
                  <FaImage />
                  <input type="file" hidden onChange={handleImageUpload} />
                </label>

                <FaMapMarkerAlt
                  className="cursor-pointer"
                  onClick={() =>
                    setShowLocationInput(!showLocationInput)
                  }
                />
              </div>

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
        <div key={post.id} className="bg-white border rounded-xl shadow-sm">
          <div className="flex justify-between p-4">

            <div className="flex gap-3 items-start">
              <FaUserCircle className="text-3xl text-gray-400" />
              <div>
                <p className="font-semibold text-sm">{post.author}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span
                    className={`px-2 rounded-full ${
                      post.incidentType === "Fire"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {post.incidentType}
                  </span>
                  <span>· {post.time}</span>
                </div>
                {post.location && (
                  <p className="text-xs text-gray-500 flex gap-1 mt-1">
                    <FaMapMarkerAlt /> {post.location}
                  </p>
                )}
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <FaEllipsisH
                className="cursor-pointer text-gray-400"
                onClick={() =>
                  setActiveMenu(activeMenu === post.id ? null : post.id)
                }
              />
              {activeMenu === post.id && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg">
                  <button
                    onClick={() => toggleInterested(post.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {post.interested ? "★ Interested" : "☆ Mark Interested"}
                  </button>
                  <button
                    onClick={() => toggleSaved(post.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {post.saved ? "✓ Saved" : "Save Post"}
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 text-sm">{post.content}</div>

          {post.image && (
            <img src={post.image} className="w-full mt-3 rounded-b-xl" />
          )}

          <div className="flex justify-between px-6 py-3 border-t text-sm text-gray-600">
            <button className="flex items-center gap-2 hover:text-black">
              <FaRegComment /> Comment
            </button>
            <button className="flex items-center gap-2 hover:text-black">
              <FaShare /> Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
