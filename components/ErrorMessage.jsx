export default function ErrorMessage({ message, onDismiss }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <span className="text-sm">{message}</span>
        <button
          onClick={onDismiss}
          className="text-red-800 hover:text-red-900 text-lg"
          aria-label="Dismiss error message"
        >
          ×
        </button>
      </div>
    </div>
  );
}
