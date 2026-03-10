/**
 * Password Strength Meter Component
 * Shows visual feedback for password strength
 */
export default function PasswordStrength({ password }) {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "gray" };

    let score = 0;

    // Length check
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z\d]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "red" };
    if (score <= 3) return { score: 2, label: "Fair", color: "yellow" };
    if (score <= 4) return { score: 3, label: "Good", color: "blue" };
    return { score: 4, label: "Strong", color: "green" };
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  const colors = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
  };

  const textColors = {
    red: "text-red-600",
    yellow: "text-yellow-600",
    blue: "text-blue-600",
    green: "text-green-600",
  };

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all ${
              level <= strength.score ? colors[strength.color] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[strength.color]}`}>
        Password strength: {strength.label}
      </p>
    </div>
  );
}
