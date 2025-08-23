'use client';

import { useState } from 'react';
import { Edit3, Trash2, CheckCircle, Circle, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { NOTE_TYPES, PRIORITIES } from '@/types';

const priorityColors = {
  [PRIORITIES.LOW]: 'bg-green-100 text-green-800',
  [PRIORITIES.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [PRIORITIES.HIGH]: 'bg-red-100 text-red-800'
};

const typeColors = {
  [NOTE_TYPES.NOTE]: 'bg-blue-100 text-blue-800',
  [NOTE_TYPES.GOAL]: 'bg-purple-100 text-purple-800',
  [NOTE_TYPES.EVENT]: 'bg-orange-100 text-orange-800'
};

export default function NoteCard({ note, onEdit, onDelete, onToggleComplete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  // Hide secret notes if not logged in
  if (note.secret && !isLoggedIn) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(note.id);
    setIsDeleting(false);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
        note.completed
          ? 'border-gray-300 opacity-75'
          : note.type === NOTE_TYPES.GOAL
          ? 'border-purple-500'
          : note.type === NOTE_TYPES.EVENT
          ? 'border-orange-500'
          : 'border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {note.type === NOTE_TYPES.GOAL && (
            <button
              onClick={() => onToggleComplete(note.id, !note.completed)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {note.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
          <h3
            className={`font-semibold ${
              note.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {note.title}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(note)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className={`text-gray-600 mb-3 ${note.completed ? 'line-through text-gray-400' : ''}`}>
        {note.content}
      </p>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className={`px-2 py-1 rounded-full ${typeColors[note.type]}`}>
          {note.type}
        </span>
        <span className={`px-2 py-1 rounded-full ${priorityColors[note.priority]}`}>
          {note.priority}
        </span>
        {note.due_date && (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            Due: {new Date(note.due_date).toLocaleDateString()}
          </span>
        )}
        {note.completed && (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
            Completed
          </span>
        )}
        {note.secret && isLoggedIn && (
          <span className="flex items-center px-2 py-1 rounded-full bg-gray-800 text-white">
            <Lock className="w-3 h-3 mr-1" />
            Secret
          </span>
        )}
      </div>
    </div>
  );
}
