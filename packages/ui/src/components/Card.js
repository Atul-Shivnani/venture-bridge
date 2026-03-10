/**
 * Reusable Card Component
 * Flexible container with glassmorphism support
 */
export default function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
  hover = false,
  ...props
}) {
  const variants = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white shadow-lg border border-gray-100",
    glass:
      "bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl",
    gradient:
      "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md",
    flat: "bg-gray-50 border border-gray-200",
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl transition-all duration-300
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? "hover:shadow-xl hover:scale-[1.02] cursor-pointer" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
