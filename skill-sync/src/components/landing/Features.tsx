import styles from '@/app/(public)/Landing.module.css';

export default function Features() {
  const steps = [
    {
      number: "1",
      title: "Post a Proposal",
      desc: "Share a skill you can teach and what you're eager to learn in return. Be specific!",
    },
    {
      number: "2",
      title: "Find Your Match",
      desc: "Browse proposals from others or let our system suggest a perfect partner for your skill swap.",
    },
    {
      number: "3",
      title: "Swap & Learn",
      desc: "Connect with your partner, schedule sessions, and start the exciting knowledge exchange.",
    },
    {
      number: "4",
      title: "Get Endorsed",
      desc: "Complete a swap and receive a verified skill badge on your profile to build your reputation.",
    },
  ];

  return (
    <section id="features" className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionDescription}>
            Four simple steps to unlock a world of knowledge without spending a dime.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {steps.map((step) => (
            <div key={step.number} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                {step.number}
              </div>
              <h3 className={styles.featureTitle}>{step.title}</h3>
              <p className={styles.featureDescription}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}