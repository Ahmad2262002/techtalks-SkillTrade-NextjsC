
export default function Features() {
  const steps = [
    {
      number: "1",
      title: "Post a Proposal",
      desc: "Share what you can teach and what you want to learn.",
    },
    {
      number: "2",
      title: "Find a Match",
      desc: "Connect with someone who complements your skills.",
    },
    {
      number: "3",
      title: "Swap & Learn",
      desc: "Schedule a session and start the knowledge exchange.",
    },
    {
      number: "4",
      title: "Get Endorsed",
      desc: "Receive a verified skill badge upon completion.",
    },
  ];

  return (
    <section id="features" className="py-20 px-8 md:px-16 bg-[#071a2a] text-white -mt-10 relative z-20">
      <h2 className="text-4xl md:text-5xl font-bold mb-12 text-left bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6a5cff] to-[#ff7bd6] flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
              {step.number}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}