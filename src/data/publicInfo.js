export const PUBLIC_CONTACT_EMAIL = "cyclecoach.app@gmail.com";
export const PUBLIC_INFO_EFFECTIVE_DATE = "September 19, 2026";

export const publicInfoPages = {
  privacy: {
    eyebrow: "Public preview",
    title: "Privacy",
    lead:
      "Cycle Coach is local-first. This page explains what the current preview stores, what the hosting infrastructure processes, and what happens if you contact us.",
    sections: [
      {
        id: "operator",
        title: "Operator and contact",
        paragraphs: [
          "Cycle Coach is operated by Aleksandar Todorovic in Serbia.",
          "For privacy questions, feedback, or support, use the project email below.",
        ],
        links: [
          {
            label: PUBLIC_CONTACT_EMAIL,
            href: `mailto:${PUBLIC_CONTACT_EMAIL}`,
          },
        ],
      },
      {
        id: "local-storage",
        title: "Workout data stays in your browser",
        paragraphs: [
          "The current preview stores workout progress locally in your browser. This includes plan and cycle progress, set completion, weights, reps, RIR values, and related training-log state.",
          "A one-time safety acknowledgement is also stored locally so the first-start notice does not need to appear every time.",
          "There is currently no Cycle Coach account, workout database, or cloud backup. Clearing browser or site storage can remove locally saved progress.",
        ],
      },
      {
        id: "hosting",
        title: "Hosting and technical requests",
        paragraphs: [
          "Cycle Coach is delivered through Firebase Hosting, a Google service. Like other hosted websites, the hosting infrastructure processes technical request information needed to deliver, operate, and protect the site.",
          "For the current preview, Google Analytics is not enabled, Firebase Performance Monitoring is not configured, and the Firebase Hosting Cloud Logging integration is not linked. Authentication, Firestore, Cloud Storage, and Cloud Functions are not active for the app.",
        ],
      },
      {
        id: "email",
        title: "If you email Cycle Coach",
        paragraphs: [
          "If you contact Cycle Coach by email, we receive the sender address and the information, screenshots, or attachments you choose to include. Gmail and Google infrastructure process those messages to provide the mailbox.",
          "Please do not send medical records, diagnoses, or other sensitive health information that is not necessary for your feedback. Review screenshots before sending them because they may contain workout information or other personal details.",
        ],
      },
      {
        id: "retention",
        title: "How long information is kept",
        paragraphs: [
          "Workout progress remains in your browser until you clear it, reset local progress, or browser storage becomes unavailable.",
          "Ordinary preview email and feedback are kept only while reasonably needed to read, respond to, investigate, and use the feedback for product validation. The current preview does not use an automated fixed retention period for the project inbox.",
        ],
      },
      {
        id: "tracking",
        title: "No advertising or app analytics",
        paragraphs: [
          "The current preview does not intentionally use advertising pixels or an application analytics SDK.",
          "If the product later adds analytics, accounts, cloud sync, payments, or other material data flows, this notice will need to be updated before those changes are treated as part of the public product.",
        ],
      },
      {
        id: "choices",
        title: "Your choices",
        paragraphs: [
          "You can use Reset local progress in the app or clear the site's browser storage to remove locally stored workout progress from that browser.",
          "For questions or requests relating to information you sent by email, contact the project address. Privacy rights may vary by location, and applicable legal rights are not limited by this notice.",
        ],
      },
      {
        id: "age",
        title: "Age",
        paragraphs: [
          "The current public preview is intended for adults aged 18 and over. Cycle Coach does not collect dates of birth or identity documents for age verification.",
        ],
      },
    ],
  },

  "preview-terms": {
    eyebrow: "Public preview",
    title: "Preview Terms",
    lead:
      "These terms describe the current free Cycle Coach preview. They are intentionally limited to the product that exists today.",
    sections: [
      {
        id: "preview",
        title: "Free preview",
        paragraphs: [
          "Cycle Coach is currently provided as a free public preview for testing and product validation. Features, training content, design, and availability may change while the product is being developed.",
          "The preview is intended for adults aged 18 and over.",
        ],
      },
      {
        id: "fitness-boundary",
        title: "General fitness guidance",
        paragraphs: [
          "Cycle Coach provides predefined training plans, workout guidance, logging, and general educational fitness information.",
          "It does not provide medical diagnosis, treatment, rehabilitation, individualized healthcare advice, or a professional assessment of whether exercise is suitable for you.",
        ],
      },
      {
        id: "results",
        title: "No guaranteed results",
        paragraphs: [
          "Exercise results vary between people. Cycle Coach does not guarantee fat loss, muscle gain, strength increases, injury prevention, or any other specific training or body-composition result.",
        ],
      },
      {
        id: "responsibility",
        title: "Training responsibility",
        paragraphs: [
          "Exercise involves inherent risk. Use loads, equipment, ranges of motion, and training methods that you can control safely. Use appropriate safeties or a spotter where relevant.",
          "Stop if you experience sharp, unusual, or concerning pain or symptoms. Seek appropriate medical or professional advice when an injury, health condition, pregnancy, medication, or prior professional advice may affect what is suitable for you.",
        ],
      },
      {
        id: "storage",
        title: "Local storage and no cloud backup",
        paragraphs: [
          "Workout progress in the current preview is stored locally in your browser. There is no Cycle Coach account or cloud backup.",
          "Local progress can be lost if browser or site storage is cleared, blocked, corrupted, or otherwise unavailable.",
        ],
      },
      {
        id: "availability",
        title: "Preview availability",
        paragraphs: [
          "The preview may be changed, interrupted, reset, or withdrawn as development continues. Do not rely on it as the only permanent record of information you need to keep.",
        ],
      },
      {
        id: "use",
        title: "Personal and lawful use",
        paragraphs: [
          "Use the preview for your own lawful personal use. Do not misuse the service, interfere with its operation, or use it in a way that violates applicable law or the rights of others.",
        ],
      },
      {
        id: "ownership",
        title: "Product ownership",
        paragraphs: [
          "Cycle Coach branding, original app copy, interface work, and software remain the property of the operator or their respective rights holders to the extent protected by applicable law.",
          "These preview terms do not transfer ownership of the product or grant permission to redistribute the app as your own service.",
        ],
      },
      {
        id: "mandatory-rights",
        title: "Applicable rights",
        paragraphs: [
          "Nothing in these preview terms is intended to remove legal rights or protections that cannot lawfully be excluded.",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        paragraphs: [
          "Questions about the preview can be sent to the project email.",
        ],
        links: [
          {
            label: PUBLIC_CONTACT_EMAIL,
            href: `mailto:${PUBLIC_CONTACT_EMAIL}`,
          },
        ],
      },
    ],
  },

  "fitness-safety": {
    eyebrow: "Training boundary",
    title: "Fitness & Safety",
    lead:
      "Cycle Coach is a training companion, not medical care. Use the plan as guidance and keep safety ahead of the log.",
    sections: [
      {
        id: "general",
        title: "General guidance, not medical advice",
        paragraphs: [
          "Cycle Coach provides general fitness information and predefined strength-training guidance. It does not diagnose conditions, prescribe medical treatment, provide rehabilitation, or determine whether a particular exercise is medically suitable for you.",
          "The public preview is intended for adults aged 18 and over.",
        ],
      },
      {
        id: "before-training",
        title: "Before training",
        bullets: [
          "Choose loads and variations you can control with stable technique.",
          "Set up equipment correctly and use safeties or a spotter where appropriate.",
          "If you are new to resistance training or unsure about setup or technique, get qualified in-person instruction.",
          "Seek appropriate medical or professional advice if an injury, health condition, pregnancy, medication, or prior professional advice may affect exercise suitability.",
        ],
      },
      {
        id: "during-training",
        title: "During training",
        bullets: [
          "Keep reps controlled and stop before technique breaks down.",
          "RIR is an estimate, not an exact measurement.",
          "Do not force a prescribed load, rep target, range of motion, or variation when it does not feel controllable.",
          "Stop training if you experience sharp, unusual, or concerning pain or symptoms. Seek appropriate medical care when symptoms are severe or concerning.",
        ],
      },
      {
        id: "advanced",
        title: "Advanced intensity techniques",
        paragraphs: [
          "Dropsets, rest-pause, clusters, loaded stretches, and other advanced methods are optional intensity tools. They are not required for progress.",
          "Skip them when normal working sets are not controlled, form is breaking down, fatigue is too high, or pain or joint irritation is present.",
        ],
      },
      {
        id: "results",
        title: "Training outcomes vary",
        paragraphs: [
          "Training response depends on many factors, including program execution, nutrition, sleep, recovery, health, training history, and individual differences.",
          "Cycle Coach does not guarantee a specific strength, muscle, fat-loss, body-composition, or injury-prevention result.",
        ],
      },
    ],
  },

  contact: {
    eyebrow: "Project contact",
    title: "Contact",
    lead:
      "Found a bug, have a suggestion, or need to ask about privacy? Use the dedicated Cycle Coach project inbox.",
    sections: [
      {
        id: "email",
        title: "Email",
        paragraphs: [
          "Cycle Coach is operated by Aleksandar Todorovic in Serbia.",
        ],
        links: [
          {
            label: PUBLIC_CONTACT_EMAIL,
            href: `mailto:${PUBLIC_CONTACT_EMAIL}`,
          },
        ],
      },
      {
        id: "feedback",
        title: "What to send",
        bullets: [
          "A short description of the bug or suggestion.",
          "The screen or workflow where it happened.",
          "A screenshot if it genuinely helps explain the issue.",
        ],
      },
      {
        id: "privacy",
        title: "Protect your information",
        paragraphs: [
          "Please avoid sending medical records, diagnoses, or other unnecessary sensitive health information.",
          "Review screenshots before sending them because they may contain workout values or other personal information.",
        ],
      },
      {
        id: "support-boundary",
        title: "Preview support",
        paragraphs: [
          "This inbox is for product feedback, support, and privacy questions. It is not a medical or emergency service, and response times are not guaranteed during the preview.",
        ],
      },
    ],
  },
};
