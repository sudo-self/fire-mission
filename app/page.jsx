'use client';

import { useState, useEffect } from 'react';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';
import CalendarView from '../components/CalendarView';
import { NOTE_TYPES } from '../types';
import { Book, Target, Calendar, Plus, Layout, Grid, Crown, Github } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [activeView, setActiveView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      let data = await res.json();

      // Filter secret notes client-side if not logged in
      if (!isLoggedIn) data = data.filter(note => !note.secret);

      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again.');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      if (noteData.secret && !isLoggedIn) {
        setError("You must be logged in to create secret notes.");
        return;
      }
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      if (!res.ok) throw new Error('Failed to create note');
      setShowForm(false);
      fetchNotes();
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note. Please try again.');
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      if (!res.ok) throw new Error('Failed to update note');
      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...note, completed })
      });
      if (!res.ok) throw new Error('Failed to update note');
      fetchNotes();
    } catch (err) {
      console.error('Error toggling complete:', err);
      setError('Failed to update note. Please try again.');
    }
  };

  const filteredNotes = Array.isArray(notes)
    ? notes.filter(note => {
        if (filter === 'all') return true;
        if (filter === 'completed') return note.completed;
        if (filter === 'active') return !note.completed;
        return note.type === filter;
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-white hidden sm:inline">King of Battle</span>
            </div>

            {/* Navigation & Auth */}
            <div className="flex items-center space-x-4">

              {/* Navigation */}
              <nav className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setFilter('note')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'note'
                      ? 'bg-red-100 text-red-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Book className="w-4 h-4 mr-1" /> Notes
                </button>
                <button
                  onClick={() => setFilter('goal')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'goal'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Target className="w-4 h-4 mr-1" /> Goals
                </button>
                <button
                  onClick={() => setFilter('event')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'event'
                      ? 'bg-gray-100 text-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-1" /> Events
                </button>

                {/* View toggles */}
                <div className="flex items-center space-x-1 sm:ml-2">
                  <button
                    onClick={() => setActiveView('list')}
                    className={`p-2 rounded-md transition-colors ${
                      activeView === 'list'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                    title="List View"
                  >
                    <Layout className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveView('calendar')}
                    className={`p-2 rounded-md transition-colors ${
                      activeView === 'calendar'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                    title="Calendar View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </nav>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {status === "loading" ? (
                  <span className="text-gray-400 text-sm">Checking session...</span>
                ) : session ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm hidden sm:inline">
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
                  <button
                    onClick={() => signIn("github")}
                    className="bg-black text-white px-3 py-1 rounded hover:bg-gray-900 flex items-center space-x-1 text-sm"
                  >
                    <Github className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {filter === 'note' && 'Notes'}
            {filter === 'goal' && 'Goals'}
            {filter === 'event' && 'Events'}
            {filter === 'all' && 'Dashboard'}
            {filter === 'completed' && 'Completed'}
            {filter === 'active' && 'Current'}
          </h1>
          <p className="text-gray-600">
            {filter === 'all' && 'Everything in one place'}
            {filter === 'note' && 'Capture your thoughts and ideas'}
            {filter === 'goal' && 'Track your progress and achievements'}
            {filter === 'event' && 'Manage your schedule and appointments'}
            {filter === 'completed' && 'Celebrate your accomplishments'}
            {filter === 'active' && 'Items that need your attention'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 mx-auto max-w-2xl">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-800 hover:text-red-900 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Add New Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:from-red-700 hover:to-yellow-600 transition-all transform hover:scale-105 flex items-center mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New {filter !== 'all' ? filter : 'Item'}
          </button>
        </div>

        {/* Form */}
        {(showForm || editingNote) && (
          <div className="mb-8 max-w-2xl mx-auto">
            <NoteForm
              onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
              initialData={editingNote || {}}
              onCancel={() => {
                setShowForm(false);
                setEditingNote(null);
              }}
            />
          </div>
        )}

        {/* Notes Content */}
        {activeView === 'list' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
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
              <p className="text-center col-span-full text-gray-500">No notes to display</p>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <CalendarView notes={notes} />
          </div>
        )}
      </main>
    </div>
  );
}
