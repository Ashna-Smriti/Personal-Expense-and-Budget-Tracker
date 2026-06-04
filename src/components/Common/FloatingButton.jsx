export default function FloatingButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
    >
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}
