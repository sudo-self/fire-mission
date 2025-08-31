"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import NoteForm from "../components/NoteForm";
import NoteCard from "../components/NoteCard";
import CalendarView from "../components/CalendarView";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { NOTE_TYPES } from "../types";
import {
  Book,
  Target,
  Calendar,
  Plus,
  Layout,
  Grid,
  Crown,
  Github,
  Menu,
  X,
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import RssFeedWidget from "../components/RssFeedWidget";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [activeView, setActiveView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  const filteredNotes = useMemo(() => {
    if (!Array.isArray(notes)) return [];
    return notes.filter((note) => {
      if (filter === "all") return true;
      if (filter === "completed") return note.completed;
      if (filter === "active") return !note.completed;
      return note.type === filter;
    });
  }, [notes, filter]);

  const fetchNotes = useCallback(async () => {
    if (status === "loading") return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/notes");
      if (!res.ok) {
        throw new Error(
          `Failed to fetch notes: ${res.status} ${res.statusText}`,
        );
      }
      let data = await res.json();
      if (!isLoggedIn) {
        data = data.filter((note) => !note.secret);
      }
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load notes. Please try again.");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, status]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleApiCall = async (url, options, successMessage) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      fetchNotes();
      if (successMessage) console.log(successMessage);
      return true;
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "An error occurred");
      return false;
    }
  };

  const handleCreateNote = async (noteData) => {
    if (noteData.secret && !isLoggedIn) {
      setError("You must be logged in to create secret notes.");
      return;
    }
    const success = await handleApiCall(
      "/api/notes",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      },
      "Note created successfully",
    );
    if (success) setShowForm(false);
  };

  const handleUpdateNote = async (noteData) => {
    const success = await handleApiCall(
      `/api/notes/${editingNote.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      },
      "Note updated successfully",
    );
    if (success) setEditingNote(null);
  };

  const handleDeleteNote = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?",
    );
    if (!confirmed) return;
    await handleApiCall(
      `/api/notes/${id}`,
      { method: "DELETE" },
      "Note deleted successfully",
    );
  };

  const handleToggleComplete = async (id, completed) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    await handleApiCall(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...note, completed }),
    });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setMobileMenuOpen(false);
  };

  const handleViewChange = (newView) => {
    setActiveView(newView);
    setMobileMenuOpen(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  if (loading && status !== "loading") {
    return <LoadingSpinner message="Loading your notes..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-white hidden sm:inline">
                King of Battle
              </span>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="ml-4 p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 sm:hidden"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="hidden sm:flex items-center space-x-4">
              <nav className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => handleFilterChange("note")}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === "note" ? "bg-red-100 text-red-800" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                  aria-pressed={filter === "note"}
                >
                  <Book className="w-4 h-4 mr-1" />
                  Notes
                </button>
                <button
                  onClick={() => handleFilterChange("goal")}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === "goal" ? "bg-yellow-100 text-yellow-800" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                  aria-pressed={filter === "goal"}
                >
                  <Target className="w-4 h-4 mr-1" />
                  Goals
                </button>
                <button
                  onClick={() => handleFilterChange("event")}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === "event" ? "bg-gray-100 text-gray-800" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                  aria-pressed={filter === "event"}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Events
                </button>

                <div className="flex items-center space-x-1 sm:ml-2">
                  <button
                    onClick={() => handleViewChange("list")}
                    className={`p-2 rounded-md transition-colors ${activeView === "list" ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                    title="List View"
                    aria-pressed={activeView === "list"}
                  >
                    <Layout className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewChange("calendar")}
                    className={`p-2 rounded-md transition-colors ${activeView === "calendar" ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                    title="Calendar View"
                    aria-pressed={activeView === "calendar"}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </nav>

              <div className="flex items-center space-x-2 ml-4">
                {status === "loading" ? (
                  <span className="text-gray-400 text-sm">
                    Checking session...
                  </span>
                ) : session ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm hidden md:inline">
                      Hi, {session.user.name || session.user.email}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center space-x-1 text-sm"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => signIn("github")}
                      className="bg-black text-white px-3 py-1 rounded hover:bg-gray-900 flex items-center space-x-1 text-sm"
                    >
                      <Github className="w-4 h-4" />
                      &nbsp;Login
                    </button>
                    <button
                      onClick={() => signIn("google")}
                      className="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-100 flex items-center space-x-1 text-sm border border-gray-300"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 533.5 544.3">
                        <path
                          fill="#4285F4"
                          d="M533.5 278.4c0-18.4-1.5-36-4.3-53.3H272v100.8h146.9c-6.4 34.5-25.7 63.8-54.8 83.6v69.5h88.5c51.7-47.7 81.9-117.8 81.9-201.6z"
                        />
                        <path
                          fill="#34A853"
                          d="M272 544.3c73.6 0 135.4-24.5 180.6-66.7l-88.5-69.5c-24.6 16.5-56.2 26-92.1 26-70.9 0-131-47.9-152.4-112.3H29.7v70.5C74.8 485.3 167.5 544.3 272 544.3z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M119.6 324.8c-11.6-34.8-11.6-72.1 0-106.9v-70.5H29.7C-4.3 230.1-4.3 314.2 29.7 406.3l89.9-70.5z"
                        />
                        <path
                          fill="#EA4335"
                          d="M272 107.7c38.8 0 73.7 13.4 101.2 39.7l76-76C407.3 24.4 345.5 0 272 0 167.5 0 74.8 59 29.7 148.5l89.9 70.5C141 155.6 201.1 107.7 272 107.7z"
                        />
                      </svg>
                      &nbsp;Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="sm:hidden bg-gray-800 pt-2 pb-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleFilterChange("note")}
                  className={`flex flex-col items-center justify-center p-3 rounded-md ${filter === "note" ? "bg-red-100 text-red-800" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                  aria-pressed={filter === "note"}
                >
                  <Book className="w-5 h-5 mb-1" />
                  <span className="text-xs">Notes</span>
                </button>
                <button
                  onClick={() => handleFilterChange("goal")}
                  className={`flex flex-col items-center justify-center p-3 rounded-md ${filter === "goal" ? "bg-yellow-100 text-yellow-800" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                  aria-pressed={filter === "goal"}
                >
                  <Target className="w-5 h-5 mb-1" />
                  <span className="text-xs">Goals</span>
                </button>
                <button
                  onClick={() => handleFilterChange("event")}
                  className={`flex flex-col items-center justify-center p-3 rounded-md ${filter === "event" ? "bg-gray-100 text-gray-800" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                  aria-pressed={filter === "event"}
                >
                  <Calendar className="w-5 h-5 mb-1" />
                  <span className="text-xs">Events</span>
                </button>
                <div className="flex items-center justify-center space-x-2 p-3">
                  <button
                    onClick={() => handleViewChange("list")}
                    className={`p-2 rounded-md ${activeView === "list" ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                    aria-pressed={activeView === "list"}
                  >
                    <Layout className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleViewChange("calendar")}
                    className={`p-2 rounded-md ${activeView === "calendar" ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                    aria-pressed={activeView === "calendar"}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-2 pt-2 pb-3 border-t border-gray-700">
                {status === "loading" ? (
                  <span className="text-gray-400 text-sm">
                    Checking session...
                  </span>
                ) : session ? (
                  <div className="flex flex-col space-y-2">
                    <span className="text-gray-300 text-sm px-4 py-2">
                      Hi, {session.user.name || session.user.email}
                    </span>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-left"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        signIn("github");
                        setMobileMenuOpen(false);
                      }}
                      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center space-x-2"
                    >
                      <Github className="w-5 h-5" />
                      <span>Login with GitHub</span>
                    </button>
                    <button
                      onClick={() => {
                        signIn("google");
                        setMobileMenuOpen(false);
                      }}
                      className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 flex items-center space-x-2 border border-gray-300"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
                        <path
                          fill="#4285F4"
                          d="M533.5 278.4c0-18.4-1.5-36-4.3-53.3H272v100.8h146.9c-6.4 34.5-25.7 63.8-54.8 83.6v69.5h88.5c51.7-47.7 81.9-117.8 81.9-201.6z"
                        />
                        <path
                          fill="#34A853"
                          d="M272 544.3c73.6 0 135.4-24.5 180.6-66.7l-88.5-69.5c-24.6 16.5-56.2 26-92.1 26-70.9 0-131-47.9-152.4-112.3H29.7v70.5C74.8 485.3 167.5 544.3 272 544.3z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M119.6 324.8c-11.6-34.8-11.6-72.1 0-106.9v-70.5H29.7C-4.3 230.1-4.3 314.2 29.7 406.3l89.9-70.5z"
                        />
                        <path
                          fill="#EA4335"
                          d="M272 107.7c38.8 0 73.7 13.4 101.2 39.7l76-76C407.3 24.4 345.5 0 272 0 167.5 0 74.8 59 29.7 148.5l89.9 70.5C141 155.6 201.1 107.7 272 107.7z"
                        />
                      </svg>
                      <span>Login with Google</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {filter === "note"
              ? "Notes"
              : filter === "goal"
                ? "Goals"
                : filter === "event"
                  ? "Events"
                  : filter === "completed"
                    ? "Completed"
                    : filter === "active"
                      ? "Current"
                      : "Dashboard"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {filter === "all"
              ? "Everything in one place"
              : filter === "note"
                ? "Capture your thoughts and ideas"
                : filter === "goal"
                  ? "Track your progress and achievements"
                  : filter === "event"
                    ? "Manage your schedule and appointments"
                    : filter === "completed"
                      ? "Celebrate your accomplishments"
                      : "Items that need your attention"}
          </p>
        </div>

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}

        <div className="text-center mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-5 py-3 rounded-lg shadow-md hover:from-red-700 hover:to-yellow-600 transition-all w-full sm:w-auto"
          >
            <div className="flex items-center justify-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New {filter !== "all" ? filter : "Item"}
            </div>
          </button>
        </div>

        {(showForm || editingNote) && (
          <div className="mb-6 max-w-2xl mx-auto">
            <NoteForm
              onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
              initialData={editingNote || {}}
              onCancel={closeForm}
            />
          </div>
        )}

        {activeView === "list" ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={setEditingNote}
                  onDelete={handleDeleteNote}
                  onToggleComplete={handleToggleComplete}
                  session={session}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-2">
                  {filter === "completed" ? (
                    <Target className="w-12 h-12 mx-auto" />
                  ) : (
                    <Book className="w-12 h-12 mx-auto" />
                  )}
                </div>
                <p className="text-gray-500">
                  {filter === "completed"
                    ? "No completed items yet"
                    : "No notes to display. Create your first one!"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <CalendarView
              notes={notes}
              onEventCreate={(date) => {
                setEditingNote({
                  type: "event",
                  title: "",
                  description: "",
                  due_date: date,
                });
                setShowForm(true);
              }}
              onEventEdit={(event) => {
                setEditingNote(event);
                setShowForm(true);
              }}
            />
          </div>
        )}
        <RssFeedWidget />
      </main>
    </div>
  );
}





















