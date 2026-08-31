import { RandomText } from "~/components/random-text";

const faqs = [
  {
    question: "How many players per team?",
    answer: [
      "Each team consists of exactly 4 players — 2 Fighting Game competitors and 2 Soccer (EAFC) competitors.",
      "Both sides must be filled for a team to be considered complete and eligible to compete.",
    ],
  },
  {
    question: "What if my team has only one type of player?",
    answer: [
      "If your group is all Fighting Game or all Soccer players, we'll split you into two separate teams so the 2-and-2 balance is maintained.",
      "A valid team always requires 2 players from each discipline — no exceptions.",
    ],
  },
  {
    question: "Can one person play both games?",
    answer: [
      "Yes, but each additional slot costs ₦10,000. A person can take a maximum of 2 slots — one per game.",
      "You cannot take two slots in the same game (e.g., no competing as MK twice). It must be one MK and one FIFA slot.",
    ],
  },
  {
    question: "How is the prize pot shared?",
    answer: [
      "Only the winning players in each discipline receive the prize money. If the Soccer side wins, both Soccer players get ₦200,000 each.",
      "The Fighting Game players on the same team receive souvenirs and join the celebration, but not the cash prize.",
    ],
  },
  {
    question: "Is there a runner-up prize?",
    answer: [
      "Yes. Second place pays ₦100,000 each to the winners in MK or FIFA.",
    ],
  },
  {
    question: "Where in Port-Harcourt is the event?",
    answer: [
      "Pre-competition meetup is at InSpace — 71 NTA Road, Mgbuoba.",
      "The actual competition venue is still to be decided and will be announced closer to the date.",
    ],
  },
  {
    question: "Will accommodations be provided for out-of-state participants?",
    answer: [
      "We won't be handling accommodations for out-of-state participants.",
      "You're welcome to arrange your own stay if the event runs long or spans multiple days.",
    ],
  },
];

export function FAQs() {
  return (
    <div className="flex md:min-h-screen items-start bg-background py-6 md:py-24 gap-4">
      <h1 className="px-8 hidden md:block text-5xl sticky top-(--header-height) font-semibold font-heading text-pretty basis-4/12">
        <RandomText animate="in-view" viewport={{ once: true }}>
          Frequently Asked <br /> Questions
        </RandomText>
      </h1>

      <div className="w-full md:basis-8/12 px-4 md:pl-16">
        <h2 className="md:hidden font-heading tracking-tighter font-bold text-3xl mb-4">
          <RandomText animate="in-view" viewport={{ once: true }}>
            Frequently Asked <br /> Questions
          </RandomText>
        </h2>

        <div className="divide-y *:pb-4 divide-white/16">
          {faqs.map((faq, i) => (
            <details className="group" key={i} name="faqs">
              <summary className="group-open:text-accent-foreground text-lg marker:opacity-0 cursor-pointer py-2">
                {faq.question}
              </summary>
              <div className="pl-4 max-w-[60ch] space-y-4">
                {faq.answer.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
