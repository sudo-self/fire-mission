'use client';

import { useState, useEffect } from 'react';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';
import CalendarView from '../components/CalendarView';
import { NOTE_TYPES } from '../types';
import { Book, Target, Calendar, Plus, Layout, Grid, Crown, Github, Menu, X } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [activeView, setActiveView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => { fetchNotes(); }, [isLoggedIn]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      let data = await res.json();
      if (!isLoggedIn) data = data.filter(note => !note.secret);
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again.');
      setNotes([]);
    } finally { setLoading(false); }
  };

  const handleCreateNote = async (noteData) => {
    if (noteData.secret && !isLoggedIn) { setError("You must be logged in to create secret notes."); return; }
    try {
      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(noteData) });
      if (!res.ok) throw new Error('Failed to create note');
      setShowForm(false); fetchNotes();
    } catch (err) { console.error(err); setError('Failed to create note.'); }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(noteData) });
      if (!res.ok) throw new Error('Failed to update note');
      setEditingNote(null); fetchNotes();
    } catch (err) { console.error(err); setError('Failed to update note.'); }
  };

  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      fetchNotes();
    } catch (err) { console.error(err); setError('Failed to delete note.'); }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const note = notes.find(n => n.id === id); if (!note) return;
      const res = await fetch(`/api/notes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...note, completed }) });
      if (!res.ok) throw new Error('Failed to update note');
      fetchNotes();
    } catch (err) { console.error(err); setError('Failed to update note.'); }
  };

  const filteredNotes = Array.isArray(notes) ? notes.filter(note => {
    if (filter === 'all') return true;
    if (filter === 'completed') return note.completed;
    if (filter === 'active') return !note.completed;
    return note.type === filter;
  }) : [];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading your notes...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-white hidden sm:inline">King of Battle</span>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="ml-4 p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 sm:hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Desktop Navigation & Auth */}
            <div className="hidden sm:flex items-center space-x-4">
              <nav className="flex items-center space-x-2 sm:space-x-4">
                <button onClick={() => setFilter('note')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'note' ? 'bg-red-100 text-red-800' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}><Book className="w-4 h-4 mr-1" />Notes</button>
                <button onClick={() => setFilter('goal')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'goal' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}><Target className="w-4 h-4 mr-1" />Goals</button>
                <button onClick={() => setFilter('event')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'event' ? 'bg-gray-100 text-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}><Calendar className="w-4 h-4 mr-1" />Events</button>

                <div className="flex items-center space-x-1 sm:ml-2">
                  <button onClick={() => setActiveView('list')} className={`p-2 rounded-md transition-colors ${activeView === 'list' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`} title="List View"><Layout className="w-4 h-4" /></button>
                  <button onClick={() => setActiveView('calendar')} className={`p-2 rounded-md transition-colors ${activeView === 'calendar' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`} title="Calendar View"><Grid className="w-4 h-4" /></button>
                </div>
              </nav>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {status === 'loading' ? (
                  <span className="text-gray-400 text-sm">Checking session...</span>
                ) : session ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm hidden md:inline">Hi, {session.user.name || session.user.email}</span>
                    <button onClick={() => signOut()} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center space-x-1 text-sm">Sign out</button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button onClick={() => signIn('github')} className="bg-black text-white px-3 py-1 rounded hover:bg-gray-900 flex items-center space-x-1 text-sm"><Github className="w-4 h-4"/>&nbsp;Login</button>
                    <button onClick={() => signIn('google')} className="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-100 flex items-center space-x-1 text-sm border border-gray-300">
                      <svg className="w-4 h-4" viewBox="0 0 533.5 544.3"><path fill="#4285F4" d="M533.5 278.4c0-18.4-1.5-36-4.3-53.3H272v100.8h146.9c-6.4 34.5-25.7 63.8-54.8 83.6v69.5h88.5c51.7-47.7 81.9-117.8 81.9-201.6z"/><path fill="#34A853" d="M272 544.3c73.6 0 135.4-24.5 180.6-66.7l-88.5-69.5c-24.6 16.5-56.2 26-92.1 26-70.9 0-131-47.9-152.4-112.3H29.7v70.5C74.8 485.3 167.5 544.3 272 544.3z"/><path fill="#FBBC05" d="M119.6 324.8c-11.6-34.8-11.6-72.1 0-106.9v-70.5H29.7C-4.3 230.1-4.3 314.2 29.7 406.3l89.9-70.5z"/><path fill="#EA4335" d="M272 107.7c38.8 0 73.7 13.4 101.2 39.7l76-76C407.3 24.4 345.5 0 272 0 167.5 0 74.8 59 29.7 148.5l89.9 70.5C141 155.6 201.1 107.7 272 107.7z"/></svg>&nbsp;
                      Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-gray-800 pt-2 pb-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => { setFilter('note'); setMobileMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-md ${filter === 'note' ? 'bg-red-100 text-red-800' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                >
                  <Book className="w-5 h-5 mb-1" />
                  <span className="text-xs">Notes</span>
                </button>
                <button
                  onClick={() => { setFilter('goal'); setMobileMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-md ${filter === 'goal' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                >
                  <Target className="w-5 h-5 mb-1" />
                  <span className="text-xs">Goals</span>
                </button>
                <button
                  onClick={() => { setFilter('event'); setMobileMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-md ${filter === 'event' ? 'bg-gray-100 text-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                >
                  <Calendar className="w-5 h-5 mb-1" />
                  <span className="text-xs">Events</span>
                </button>
                <div className="flex items-center justify-center space-x-2 p-3">
                  <button
                    onClick={() => { setActiveView('list'); setMobileMenuOpen(false); }}
                    className={`p-2 rounded-md ${activeView === 'list' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                  >
                    <Layout className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => { setActiveView('calendar'); setMobileMenuOpen(false); }}
                    className={`p-2 rounded-md ${activeView === 'calendar' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="px-2 pt-2 pb-3 border-t border-gray-700">
                {status === 'loading' ? (
                  <span className="text-gray-400 text-sm">Checking session...</span>
                ) : session ? (
                  <div className="flex flex-col space-y-2">
                    <span className="text-gray-300 text-sm px-4 py-2">Hi, {session.user.name || session.user.email}</span>
                    <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-left">Sign out</button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button onClick={() => { signIn('github'); setMobileMenuOpen(false); }} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center space-x-2">
                      <Github className="w-5 h-5"/>
                      <span>Login with GitHub</span>
                    </button>
                    <button onClick={() => { signIn('google'); setMobileMenuOpen(false); }} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 flex items-center space-x-2 border border-gray-300">
                      <svg className="w-5 h-5" viewBox="0 0 533.5 544.3"><path fill="#4285F4" d="M533.5 278.4c0-18.4-1.5-36-4.3-53.3H272v100.8h146.9c-6.4 34.5-25.7 63.8-54.8 83.6v69.5h88.5c51.7-47.7 81.9-117.8 81.9-201.6z"/><path fill="#34A853" d="M272 544.3c73.6 0 135.4-24.5 180.6-66.7l-88.5-69.5c-24.6 16.5-56.2 26-92.1 26-70.9 0-131-47.9-152.4-112.3H29.7v70.5C74.8 485.3 167.5 544.3 272 544.3z"/><path fill="#FBBC05" d="M119.6 324.8c-11.6-34.8-11.6-72.1 0-106.9v-70.5H29.7C-4.3 230.1-4.3 314.2 29.7 406.3l89.9-70.5z"/><path fill="#EA4335" d="M272 107.7c38.8 0 73.7 13.4 101.2 39.7l76-76C407.3 24.4 345.5 0 272 0 167.5 0 74.8 59 29.7 148.5l89.9 70.5C141 155.6 201.1 107.7 272 107.7z"/></svg>
                      <span>Login with Google</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Welcome */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {filter === 'note' ? 'Notes' : filter === 'goal' ? 'Goals' : filter === 'event' ? 'Events' : filter === 'completed' ? 'Completed' : filter === 'active' ? 'Current' : 'Dashboard'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {filter === 'all' ? 'Everything in one place' : filter === 'note' ? 'Capture your thoughts and ideas' : filter === 'goal' ? 'Track your progress and achievements' : filter === 'event' ? 'Manage your schedule and appointments' : filter === 'completed' ? 'Celebrate your accomplishments' : 'Items that need your attention'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-auto max-w-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <button onClick={() => setError(null)} className="text-red-800 hover:text-red-900 text-lg">×</button>
            </div>
          </div>
        )}

        {/* Add New Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-5 py-3 rounded-lg shadow-md hover:from-red-700 hover:to-yellow-600 transition-all w-full sm:w-auto"
          >
            <div className="flex items-center justify-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New {filter !== 'all' ? filter : 'Item'}
            </div>
          </button>
        </div>

        {/* Form */}
        {(showForm || editingNote) && (
          <div className="mb-6 max-w-2xl mx-auto">
            <NoteForm
              onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
              initialData={editingNote || {}}
              onCancel={() => { setShowForm(false); setEditingNote(null); }}
            />
          </div>
        )}

        {/* Notes Grid */}
        {activeView === 'list' ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {filteredNotes.length > 0 ? filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} onEdit={setEditingNote} onDelete={handleDeleteNote} onToggleComplete={handleToggleComplete} session={session} />
            )) : (
              <p className="text-center col-span-full text-gray-500 py-8">No notes to display</p>
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
