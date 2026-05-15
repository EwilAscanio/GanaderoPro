const colors = [
  { name: "blue", label: "Azul", class: "bg-blue-500" },
  { name: "red", label: "Rojo", class: "bg-red-500" },
  { name: "green", label: "Verde", class: "bg-green-500" },
  { name: "purple", label: "Púrpura", class: "bg-purple-500" },
  { name: "orange", label: "Naranja", class: "bg-orange-500" },
];

export default function ColorPicker({ accentColor, onChange, onClose, compact }) {
  const handleSelect = (name) => {
    onChange(name);
    if (onClose) onClose();
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c.name}
            onClick={() => handleSelect(c.name)}
            className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-125 hover:shadow-lg ${
              accentColor === c.name ? "ring-2 ring-offset-2 scale-110" : ""
            }`}
            style={{
              ringColor: "var(--accent)",
              ringOffsetColor: "var(--bg-card)",
            }}
            title={c.label}
          >
            <span className={`inline-block w-full h-full rounded-full ${c.class}`} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((c) => (
        <button
          key={c.name}
          onClick={() => handleSelect(c.name)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 btn-hover ${
            accentColor === c.name ? "shadow-md" : ""
          }`}
          style={{
            background: accentColor === c.name
              ? "var(--accent-bg)"
              : "var(--bg-secondary)",
            color: accentColor === c.name
              ? "var(--accent)"
              : "var(--text-secondary)",
            border: accentColor === c.name
              ? "1px solid var(--accent-border)"
              : "1px solid var(--border)",
            boxShadow: accentColor === c.name
              ? `0 4px 12px color-mix(in srgb, var(--accent) 25%, transparent)`
              : "none",
          }}
        >
          <span className={`w-4 h-4 rounded-full ${c.class}`} />
          {c.label}
        </button>
      ))}
    </div>
  );
}
