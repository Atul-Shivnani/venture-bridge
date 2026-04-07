/**
 * Divider Component with optional text
 */
export default function Divider({ text, className = "" }) {
  if (text) {
    return (
      <div className={`relative my-6 ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">
            {text}
          </span>
        </div>
      </div>
    );
  }

  return <div className={`border-t border-gray-300 my-6 ${className}`} />;
}
