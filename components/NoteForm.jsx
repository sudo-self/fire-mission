'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { NOTE_TYPES, PRIORITIES } from '../types';

export default function NoteForm({ onSubmit, initialData = {}, onCancel }) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    type: initialData.type || NOTE_TYPES.NOTE,
    priority: initialData.priority || PRIORITIES.MEDIUM,
    due_date: initialData.due_date
      ? new Date(initialData.due_date).toISOString().slice(0, 16)
      : '',
    secret: isLoggedIn ? (initialData.secret || false) : false
  });

  const handleSubmit = (e) => {
    e.preventDefault();


    const submitData = { ...formData };
    if (!isLoggedIn) submitData.secret = false;

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Enter title"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        >
          <option value={NOTE_TYPES.NOTE}>Note</option>
          <option value={NOTE_TYPES.GOAL}>Goal</option>
          <option value={NOTE_TYPES.EVENT}>Event</option>
        </select>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        >
          <option value={PRIORITIES.LOW}>Low</option>
          <option value={PRIORITIES.MEDIUM}>Medium</option>
          <option value={PRIORITIES.HIGH}>High</option>
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date & Time</label>
        <input
          type="datetime-local"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Enter your content here..."
        />
      </div>

      {/* Secret Toggle */}
      {isLoggedIn ? (
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.checked })}
              className="form-checkbox h-4 w-4 text-red-600"
            />
            <span className="text-sm text-gray-700">Mark as secret</span>
          </label>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Login to mark a note as secret.</p>
      )}

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {initialData.id ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
