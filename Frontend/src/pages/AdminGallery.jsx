import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { LoaderCircle, Trash2, Upload } from "lucide-react";
import { auth, db } from "../firebase";

const initialForm = {
  title: "",
  description: "",
  location: "",
  tripDate: "",
};
const GALLERY_COLLECTION = "trip_Memories_Gallery";

export default function AdminGallery() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [memories, setMemories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Listen to the correct collection
  useEffect(() => {
    const galleryQuery = query(
      collection(db, GALLERY_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(galleryQuery, (snapshot) => {
      setMemories(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => {
      console.error("Error loading memories:", error);
    });

    return () => unsubscribe();
  }, []);

  // 2. Memoized Previews for the upload form
  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!files.length) return alert("Please choose photos.");

    setIsUploading(true);
    try {
      const data = new FormData();
      files.forEach((file) => data.append("images", file));
      
      data.append("userId", auth.currentUser?.uid || "anonymous");
      data.append("title", form.title.trim());
      data.append("description", form.description.trim());
      data.append("location", form.location.trim());
      data.append("tripDate", form.tripDate);

      const response = await axios.post(
        "https://website-cabs-travels.onrender.com/api/images/upload",
        data
      );

      const uploadedImages = response.data?.urls || [];

      if (!uploadedImages.length) {
        throw new Error("No image URLs returned from upload.");
      }

      await addDoc(collection(db, GALLERY_COLLECTION), {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        tripDate: form.tripDate || "",
        images: uploadedImages.map((imageUrl, index) => ({
          imageUrl,
          imageName: files[index]?.name || `memory-${index}`,
        })),
        uploadedBy: auth.currentUser?.uid || "anonymous",
        createdAt: serverTimestamp(),
      });

      setForm(initialForm);
      setFiles([]);
      alert("Trip memories saved!");
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (memoryId) => {
    if (!window.confirm("Delete this memory?")) return;
    try {
      await deleteDoc(doc(db, GALLERY_COLLECTION, memoryId));
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
      {/* Header Section */}
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-600">Admin Gallery</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">Upload travel memories</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_1.5fr]">
        {/* FORM SECTION */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
          <form onSubmit={handleUpload} className="space-y-4">
            <input type="text" value={form.title} placeholder="Title" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" onChange={(e) => setForm({...form, title: e.target.value})} />
            <input type="text" value={form.location} placeholder="Location" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" onChange={(e) => setForm({...form, location: e.target.value})} />
            <input type="date" value={form.tripDate} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" onChange={(e) => setForm({...form, tripDate: e.target.value})} />
            <textarea value={form.description} placeholder="Description" rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" onChange={(e) => setForm({...form, description: e.target.value})} />

            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 py-10 transition hover:border-amber-400 hover:bg-amber-50">
              <Upload size={24} className="text-amber-600" />
              <span className="text-sm font-semibold">Choose Photos</span>
              <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="hidden" />
            </label>

            {/* Form Previews */}
            {previews.length > 0 && (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900">
                    Selected photos ({previews.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-xs font-semibold text-red-500 transition hover:text-red-600"
                  >
                    Clear all
                  </button>
                </div>

                <div className="max-h-52 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previews.map((p) => (
                      <img key={p.url} src={p.url} className="h-24 w-full rounded-xl border border-slate-200 object-cover" alt={p.name || "preview"} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 rounded-[24px] bg-white/95 pt-2 backdrop-blur">
              <button type="submit" disabled={isUploading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-50">
                {isUploading ? <LoaderCircle className="animate-spin" /> : <Upload size={18} />}
                {isUploading ? "Uploading..." : "Upload Memories"}
              </button>
            </div>
          </form>
        </section>

        {/* SAVED MEMORIES SECTION */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-black text-slate-900 mb-6">Saved memories ({memories.length})</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {memories.map((memory) => (
              <article key={memory.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 flex flex-col">
                
                {/* IMAGE DISPLAY LOGIC: Show the first image from the array */}
                <div className="relative">
                  {memory.images && memory.images.length > 0 ? (
                    <img 
                      src={memory.images[0].imageUrl} 
                      className="h-56 w-full object-cover" 
                      alt={memory.title} 
                    />
                  ) : (
                    <div className="h-56 w-full bg-slate-200 flex items-center justify-center">No Image</div>
                  )}
                  {/* Badge for multiple images */}
                  {memory.images?.length > 1 && (
                    <span className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md">
                      +{memory.images.length - 1} more
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{memory.title}</h3>
                      <button onClick={() => handleDelete(memory.id)} className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">{memory.location}</p>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">{memory.description}</p>
                  </div>
                  
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {memory.tripDate || "Recent"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
