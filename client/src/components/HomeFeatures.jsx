import React from "react";
import { ShieldCheck, Vote, BarChart3 } from "lucide-react"; 

export default function HomeFeatures() {
  const features = [
    {
      icon: <Vote className="w-10 h-10 text-indigo-600" />,
      title: "Easy Voting",
      description:
        "Cast your vote securely from anywhere in just a few clicks — simple, fast, and user-friendly.",
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-indigo-600" />,
      title: "Real-Time Results",
      description:
        "Track accurate results live as votes are counted, ensuring complete transparency in the process.",
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-indigo-600" />,
      title: "Secure & Transparent",
      description:
        "Your vote is encrypted and tamper-proof, guaranteeing a fair and trustworthy election experience.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-[#F5F7FF] via-[#fffbee] to-[#E6EFFF] py-26">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          How We Work
        </h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-base md:text-lg">
          Our platform ensures a seamless election experience with secure voting, 
          live result tracking, and complete transparency every step of the way.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
