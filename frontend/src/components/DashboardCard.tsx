import React from "react";

type CardVariant = "blue" | "green" | "purple";

interface DashboardCardProps {
  title: string;
  description: string;
  badgeText: string;
  buttonText: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: CardVariant;
}

const VARIANTS = {
  blue: {
    iconWrapper: "border-[#3D6588]",
    iconColor: "text-[#7EB8E9]",
    badge: "bg-[#233C70] text-[#6CBCFF] border-[#3D6588]",
    button: "bg-[#213b7c] hover:bg-[#4874D3] border-[#4874D3]",
  },
  green: {
    iconWrapper: "border-[#10473E]",
    iconColor: "text-[#33DDA9]",
    badge: "bg-[#115D43] text-[#12FCB4] border-[#36877A]",
    button: "bg-[#285753] hover:bg-[#369071] border-[#369071]",
  },
  purple: {
    iconWrapper: "border-[#552EB7]",
    iconColor: "text-[#8E6BCF]",
    badge: "bg-[#2B185A] text-[#B494EF] border-[#6C4DA5]",
    button: "bg-[#281f59] hover:bg-[#5d43a3] border-[#5d43a3]",
  },
};

export default function DashboardCard({
  title,
  description,
  badgeText,
  buttonText,
  icon,
  onClick,
  variant = "blue",
}: DashboardCardProps) {
  const styles = VARIANTS[variant];

  return (
    <div className="bg-[#1A1F37] p-6 rounded-2xl shadow flex flex-col justify-center items-center border-2 border-[#3C4D66] h-full">
      {/* Header */}
      <div className="w-full flex items-center gap-3 mb-4">
        {/* Icon Wrapper */}
        <div
          className={`w-10 h-10 border-[2px] rounded-xl flex items-center justify-center ${styles.iconWrapper}`}
        >
          {/* We clone the icon to force the specific text color class onto it */}
          <div className={`w-6 h-6 ${styles.iconColor}`}>{icon}</div>
        </div>

        <h2 className="translate-y-1 text-xl font-semibold mb-2">{title}</h2>

        {/* Label/Badge */}
        <div
          className={`ml-auto -translate-y-1 font-semibold text-xs px-4 py-1 rounded-2xl border-[1.5px] whitespace-nowrap ${styles.badge}`}
        >
          {badgeText}
        </div>
      </div>

      <p className="mb-6 text-gray-400 w-full text-left flex-grow">
        {description}
      </p>

      <button
        onClick={onClick}
        className={`w-full text-white px-4 py-2 rounded-xl justify-center border-[2px] transition-colors duration-200 ${styles.button}`}
      >
        {buttonText}
      </button>
    </div>
  );
}