/**
 * The No Barriers Rwandan Sign Language course.
 *
 * Guided by the REB Teacher Training Manual on RSL (2025) but re-sequenced for self-study:
 * conversation first, then fingerspelling and numbers, then everyday topics, then grammar
 * and sentences, then specialised vocabulary. Every lesson teaches a few signs, checks them
 * straight away, and mixes in earlier signs for review.
 *
 * Lessons without `signs` are planned but not yet animated; they show as "coming soon".
 */
export type Level = "Beginner" | "Intermediate" | "Advanced";

/** A signed phrase or sentence and its English meaning. */
export type Phrase = { play: string[]; meaning: string };

export type LessonDef = {
  id: string;
  title: string;
  /** Can-do statement shown before the lesson. */
  goal: string;
  /** New signs taught in this lesson, in order. */
  signs?: string[];
  /** Fingerspelled words to recognise. */
  spell?: string[];
  /** Numbers to recognise (signed with the book's number system). */
  numbers?: number[];
  /** Phrases and sentences to understand. */
  phrases?: Phrase[];
  /** A short teaching note shown at the start (grammar, culture, technique). */
  note?: string;
  /** Book topics this lesson will cover when it is produced. */
  plan?: string;
};

export type UnitDef = { id: string; level: Level; title: string; summary: string; lessons: LessonDef[] };

export const CONTENT_VERSION = 1;

export const COURSE: UnitDef[] = [
  {
    id: "u1", level: "Beginner", title: "First conversations", summary: "Greet people, point to who you mean, answer yes or no.",
    lessons: [
      { id: "u1-l1", title: "Hello and goodbye", goal: "I can greet someone and say goodbye.", signs: ["greet.hello", "greet.goodbye", "basic.yes", "basic.no"],
        note: "Sign language uses the hands, the face and the body together. Keep eye contact, smile when you greet, nod with YES and shake your head with NO." },
      { id: "u1-l2", title: "Me, you and others", goal: "I can point to myself, the person I am talking to, and others.", signs: ["basic.me", "basic.you", "basic.he", "basic.we", "basic.they"],
        note: "Pronouns are made by pointing. Point to your chest for I, to the person for YOU, and to the side for HE or SHE. Once you place someone at a point in space, keep pointing there." },
      { id: "u1-l3", title: "How are you?", goal: "I can ask how someone is and answer.", signs: ["greet.how", "greet.good", "greet.fine"],
        phrases: [{ play: ["greet.how", "basic.you"], meaning: "How are you?" }, { play: ["basic.me", "greet.fine"], meaning: "I am fine." }, { play: ["basic.you", "greet.good"], meaning: "You are good." }],
        note: "Questions that ask for information (how, what, who) end with the question sign or the pointed person, with a questioning face: eyebrows drawn together, head slightly forward." },
      { id: "u1-l4", title: "Names", goal: "I can ask for a name and give mine.", signs: ["greet.name"],
        phrases: [{ play: ["greet.name", "basic.you"], meaning: "What is your name?" }, { play: ["basic.me", "greet.name", "spell:ANA"], meaning: "My name is Ana." }],
        note: "Names are fingerspelled the first time. In the Deaf community, people also receive a sign name. Never invent a sign name for yourself: it is given by the community." },
    ],
  },
  {
    id: "u2", level: "Beginner", title: "Fingerspelling", summary: "The RSL manual alphabet for names, places and new words.",
    lessons: [
      { id: "u2-l1", title: "Letters A to G", goal: "I can form and read the letters A–G.", signs: ["abc.a", "abc.b", "abc.c", "abc.d", "abc.e", "abc.f", "abc.g"], spell: ["BAD", "CAFE", "BEAD"],
        note: "Fingerspell with your dominant hand held still in front of your shoulder, palm toward the viewer. Clear shapes matter more than speed." },
      { id: "u2-l2", title: "Letters H to N", goal: "I can form and read the letters H–N.", signs: ["abc.h", "abc.i", "abc.j", "abc.k", "abc.l", "abc.m", "abc.n"], spell: ["HILL", "MILK", "JAM"],
        note: "J is drawn with the little finger. M has three fingers over the thumb, N has two: look carefully." },
      { id: "u2-l3", title: "Letters O to U", goal: "I can form and read the letters O–U.", signs: ["abc.o", "abc.p", "abc.q", "abc.r", "abc.s", "abc.t", "abc.u"], spell: ["SOUP", "TOUR", "PORT"],
        note: "P and Q point down. S has the thumb in front of the fingers; T has it tucked between the index and middle fingers." },
      { id: "u2-l4", title: "Letters V to Z", goal: "I can form and read the letters V–Z.", signs: ["abc.v", "abc.w", "abc.x", "abc.y", "abc.z"], spell: ["WAY", "ZOO", "BOX"],
        note: "Z is drawn in the air with the index finger. For a double letter, slide the hand slightly to the side." },
      { id: "u2-l5", title: "Spelling names and places", goal: "I can read fingerspelled names.", spell: ["ANA", "ERIC", "KIGALI", "HUYE", "MUSANZE", "RUBAVU"],
        note: "Read whole words, not letters one by one: watch the shape of the word as the hand moves." },
    ],
  },
  {
    id: "u3", level: "Beginner", title: "Numbers", summary: "Count, give your age and talk about money.",
    lessons: [
      { id: "u3-l1", title: "Numbers 0 to 5", goal: "I can sign and read 0–5.", signs: ["num.0", "num.1", "num.2", "num.3", "num.4", "num.5"],
        note: "When counting in RSL, the palm faces you, the signer. Five is a closed fist." },
      { id: "u3-l2", title: "Numbers 6 to 10", goal: "I can sign and read 6–10.", signs: ["num.6", "num.7", "num.8", "num.9", "num.10"],
        note: "Six to nine use both hands: the other hand is held flat and the counting fingers lie across it. Ten is two fists together." },
      { id: "u3-l3", title: "Numbers 11 to 19", goal: "I can sign and read 11–19.", numbers: [11, 12, 13, 14, 15, 16, 17, 18, 19],
        note: "Eleven to nineteen are TEN followed by the digit: 13 is 10 then 3." },
      { id: "u3-l4", title: "Tens and hundreds", goal: "I can sign numbers up to 999.", numbers: [20, 30, 40, 50, 60, 70, 80, 90, 100, 25, 48, 250],
        note: "From twenty upward, numbers are signed digit by digit, the way they are written: 20 is 2 then 0, 100 is 1, 0, 0." },
      { id: "u3-l5", title: "Thousands and prices", goal: "I can sign thousands and amounts in francs.", signs: ["num.thousand"], numbers: [1000, 2000, 5000, 10000, 1500],
        note: "A thousand is the number followed by THOUSAND: 1000 is 1 THOUSAND, 10,000 is 10 THOUSAND." },
    ],
  },
  {
    id: "u4", level: "Beginner", title: "Time of day", summary: "Morning to night, today and tomorrow, and the greetings that go with them.",
    lessons: [
      { id: "u4-l1", title: "Parts of the day", goal: "I can name the parts of the day.", signs: ["time.morning", "time.afternoon", "time.evening", "time.night", "time.now", "time.today"] },
      { id: "u4-l2", title: "Time greetings", goal: "I can greet someone at any time of day.", signs: ["greet.good-morning", "greet.good-afternoon", "greet.good-evening"],
        phrases: [{ play: ["greet.good-morning", "basic.you"], meaning: "Good morning to you." }] },
      { id: "u4-l3", title: "Yesterday, today, tomorrow", goal: "I can say when something happens.", signs: ["time.yesterday", "time.tomorrow", "time.before", "time.after", "time.late", "time.start"],
        phrases: [{ play: ["time.tomorrow", "basic.we", "time.start"], meaning: "Tomorrow we start." }, { play: ["time.yesterday", "basic.he", "time.late"], meaning: "Yesterday he was late." }],
        note: "Time comes first. Set the time at the start of the sentence, then say what happens: TOMORROW WE START." },
    ],
  },
  {
    id: "u5", level: "Beginner", title: "Days, months and time", summary: "The week, the year, dates and clock time.",
    lessons: [
      { id: "u5-l1", title: "Weekdays", goal: "I can name Monday to Friday.", signs: ["time.monday", "time.tuesday", "time.wednesday", "time.thursday", "time.friday"],
        note: "Weekdays share one pattern: touch the chin, then move out into the number of the day. Monday is 1, Friday is 5." },
      { id: "u5-l2", title: "Weekend and the clock", goal: "I can name the weekend and talk about clock time.", signs: ["time.saturday", "time.sunday", "time.time", "time.hours", "time.minutes", "time.seconds"] },
      { id: "u5-l3", title: "January to June", goal: "I can name the first six months.", signs: ["time.month", "time.january", "time.february", "time.march", "time.april", "time.may", "time.june"],
        note: "Months are MONTH followed by their number: March is MONTH 3." },
      { id: "u5-l4", title: "July to December", goal: "I can name the last six months.", signs: ["time.july", "time.august", "time.september", "time.october", "time.november", "time.december"] },
      { id: "u5-l5", title: "Dates and age", goal: "I can talk about days, years, dates and age.", signs: ["time.days", "time.year", "time.date", "time.age", "time.schedule", "time.next"],
        phrases: [{ play: ["time.age", "basic.you"], meaning: "How old are you?" }, { play: ["basic.me", "time.age", "num.2", "num.5"], meaning: "I am 25 years old." }] },
    ],
  },
  {
    id: "u6", level: "Beginner", title: "Family", summary: "Talk about the people in your family.",
    lessons: [
      { id: "u6-l1", title: "Parents and children", goal: "I can name parents and children.", signs: ["family.family", "family.parents", "family.father", "family.mother", "family.child"] },
      { id: "u6-l2", title: "Brothers, sisters, sons, daughters", goal: "I can name siblings and children.", signs: ["family.brother", "family.sister", "family.son", "family.daughter"],
        note: "Many family signs start near the forehead for male relatives and near the cheek or chin for female relatives." },
      { id: "u6-l3", title: "The wider family", goal: "I can name grandparents, aunts, uncles and cousins.", signs: ["family.grandmother", "family.grandfather", "family.aunt", "family.uncle", "family.cousin"] },
      { id: "u6-l4", title: "Marriage", goal: "I can talk about marriage and partners.", signs: ["family.husband", "family.wife", "family.marriage", "family.divorced", "family.widow"],
        phrases: [{ play: ["basic.me", "family.brother", "num.2"], meaning: "I have two brothers." }, { play: ["basic.me", "family.mother", "time.age", "num.5", "num.0"], meaning: "My mother is 50 years old." }] },
    ],
  },
  {
    id: "u7", level: "Beginner", title: "Food and drink", summary: "Everyday food, drinks and cooking.",
    lessons: [
      { id: "u7-l1", title: "Drinks", goal: "I can name common drinks.", signs: ["food.water", "food.drink", "food.milk", "food.tea", "food.coffee", "food.fanta"] },
      { id: "u7-l2", title: "Fruit and vegetables", goal: "I can name fruit and vegetables.", signs: ["food.orange", "food.mango", "food.apple", "food.banana", "food.tomato", "food.carrot", "food.cabbage"] },
      { id: "u7-l3", title: "Staple foods", goal: "I can name staple foods.", signs: ["food.beans", "food.maize", "food.wheat", "food.groundnuts", "food.porridge"] },
      { id: "u7-l4", title: "In the kitchen", goal: "I can talk about cooking.", signs: ["food.cook", "food.sugar", "food.salt", "food.oil", "food.beer", "food.wine", "food.banana-juice"],
        phrases: [{ play: ["time.today", "basic.me", "food.cook", "food.beans"], meaning: "Today I am cooking beans." }, { play: ["basic.you", "food.tea", "food.drink"], meaning: "Do you drink tea?" }] },
    ],
  },
  {
    id: "u8", level: "Beginner", title: "Clothes and colours", summary: "Describe what people wear.",
    lessons: [
      { id: "u8-l1", title: "Everyday clothes", goal: "I can name everyday clothes.", signs: ["clothes.clothes", "clothes.wear", "clothes.tshirt", "clothes.trouser", "clothes.shoe", "clothes.socks"] },
      { id: "u8-l2", title: "More clothes", goal: "I can name accessories and more clothes.", signs: ["clothes.hat", "clothes.belt", "clothes.glove", "clothes.scarf", "clothes.sweater", "clothes.vest", "clothes.uniform"] },
      { id: "u8-l3", title: "Colours", goal: "I can name colours.", signs: ["color.red", "color.blue", "color.green", "color.yellow", "color.black", "color.pink", "color.gray"],
        phrases: [{ play: ["basic.he", "clothes.wear", "clothes.tshirt", "color.red"], meaning: "He is wearing a red T-shirt." }],
        note: "Describing words usually come after the thing they describe: T-SHIRT RED." },
      { id: "u8-l4", title: "Beginner review: introduce yourself", goal: "I can greet, give my name, age and family.",
        phrases: [{ play: ["greet.hello"], meaning: "Hello." }, { play: ["basic.me", "greet.name", "spell:ERIC"], meaning: "My name is Eric." }, { play: ["basic.me", "time.age", "num.3", "num.0"], meaning: "I am 30 years old." }, { play: ["basic.me", "family.sister", "num.1"], meaning: "I have one sister." }, { play: ["greet.goodbye"], meaning: "Goodbye." }],
        note: "Put it together: greeting, name, age, family. The book's end-of-unit task asks you to introduce yourself this way." },
    ],
  },

  // Intermediate: planned from the manual, animations to be produced.
  { id: "u9", level: "Intermediate", title: "School and classroom", summary: "Classroom language: sit, stand, read, write, attention.", lessons: [
    { id: "u9-l1", title: "Classroom instructions", goal: "I can follow classroom instructions.", plan: "Sit, stand up, enter, attention, permission, remember, to learn (manual p.89–98)." },
    { id: "u9-l2", title: "School things", goal: "I can name things at school.", plan: "Book, pencil, pen, chalk, chair, classroom, toilet, reading, to draw, to paint, ball, toys." },
    { id: "u9-l3", title: "School subjects", goal: "I can name school subjects.", plan: "Mathematics, sciences, English, Kinyarwanda, French, Kiswahili, history, geography, ICT and others (p.41–46)." },
  ] },
  { id: "u10", level: "Intermediate", title: "Places in Rwanda and the world", summary: "Village to province, the 30 districts, countries.", lessons: [
    { id: "u10-l1", title: "Where I live", goal: "I can say my village, sector, district and province.", plan: "Village, sector, district, province, country, Rwanda, Kigali (p.57–68)." },
    { id: "u10-l2", title: "Kigali and the North", goal: "I can name these districts.", plan: "Nyarugenge, Gasabo, Kicukiro, Burera, Rulindo, Gakenke, Musanze, Gicumbi." },
    { id: "u10-l3", title: "East and South", goal: "I can name these districts.", plan: "Bugesera, Kirehe, Gatsibo, Kayonza, Ngoma, Nyagatare, Rwamagana, Huye, Kamonyi, Muhanga, Nyamagabe, Ruhango, Nyanza, Nyaruguru, Gisagara." },
    { id: "u10-l4", title: "The West", goal: "I can name these districts.", plan: "Rubavu, Nyabihu, Ngororero, Rutsiro, Karongi, Nyamasheke, Rusizi." },
    { id: "u10-l5", title: "Countries", goal: "I can name countries.", plan: "Burundi, Kenya, Tanzania, Uganda, France, Belgium, Germany, England, USA, Brazil, China, Japan, India, Philippines." },
  ] },
  { id: "u11", level: "Intermediate", title: "Work and roles", summary: "Jobs, leaders, health and security roles.", lessons: [
    { id: "u11-l1", title: "At school", goal: "I can name school roles.", plan: "Principal, head teacher, deputy, teacher, student, professor, patron, matron (p.78–79)." },
    { id: "u11-l2", title: "Leaders", goal: "I can name leadership roles.", plan: "Director, manager, secretary, mayor, governor, president, minister, senator, MP." },
    { id: "u11-l3", title: "Health and emergencies", goal: "I can talk about health workers and emergencies.", plan: "Nurse, doctor, dentist, emergency, ambulance, surgery, hygiene, health, danger, accident, washing hands." },
    { id: "u11-l4", title: "Trades and security", goal: "I can name trades and security roles.", plan: "Builder, driver, engineer, welder, fisher, farmer, artist, author, carpenter, plumber, lawyer, judge, soldier, police." },
  ] },
  { id: "u12", level: "Intermediate", title: "Everyday actions and feelings", summary: "Verbs to build real sentences.", lessons: [
    { id: "u12-l1", title: "Doing things", goal: "I can use everyday verbs.", plan: "Eat, go, see, take, play, sing, dance, build, read, think (p.90–97, 159–161)." },
    { id: "u12-l2", title: "Feelings and relationships", goal: "I can express feelings.", plan: "Cry, forgive, hate, appreciate, respect, take care, being polite." },
  ] },
  { id: "u13", level: "Intermediate", title: "Building sentences", summary: "RSL word order, pointing, negation and questions.", lessons: [
    { id: "u13-l1", title: "Time, topic, comment", goal: "I can order a sentence: time first, then topic, then comment.", plan: "Sentence practice reusing Beginner signs." },
    { id: "u13-l2", title: "Saying no", goal: "I can negate with NO and a head shake.", plan: "Negation with head shake; NO placement." },
    { id: "u13-l3", title: "Asking questions", goal: "I can ask yes/no and information questions with the right face.", plan: "Raised eyebrows for yes/no questions; furrowed brows for HOW, NAME, AGE questions." },
    { id: "u13-l4", title: "Short conversations", goal: "I can hold a short conversation.", plan: "Dialogues combining units 1–12." },
  ] },

  // Advanced: specialised vocabulary and fluent use.
  { id: "u14", level: "Advanced", title: "Mathematics", summary: "Operations, comparisons and problems.", lessons: [
    { id: "u14-l1", title: "Operations", goal: "I can sign sums.", plan: "Addition, subtraction, multiplication, division, equal to, greater/less than (p.98–100)." },
    { id: "u14-l2", title: "Shapes and secondary maths", goal: "I can talk about maths topics.", plan: "Angle, shape, side, unit, value, calculus, matrix, logarithms (p.117–118)." },
  ] },
  { id: "u15", level: "Advanced", title: "Sciences", summary: "Physics, chemistry and biology.", lessons: [
    { id: "u15-l1", title: "Physics", goal: "I can name physics concepts.", plan: "Acceleration, speed, density, force, pressure, energy, electricity, waves, light (p.118–123)." },
    { id: "u15-l2", title: "Chemistry", goal: "I can name chemistry concepts.", plan: "Atoms, electrons, reactions, acids, bases, laboratory, experiment (p.124–128)." },
    { id: "u15-l3", title: "Biology and health", goal: "I can name biology concepts.", plan: "Cell, genetics, DNA, anatomy, bacteria, viruses, vaccination, photosynthesis (p.129–133)." },
  ] },
  { id: "u16", level: "Advanced", title: "Technology", summary: "ICT and digital life.", lessons: [
    { id: "u16-l1", title: "Devices and files", goal: "I can talk about computers.", plan: "Mouse, laptop, flash drive, software, document, save, print, password (p.134–139)." },
    { id: "u16-l2", title: "Online life", goal: "I can talk about the internet and apps.", plan: "Website, Wi-Fi, email, social media, WhatsApp, YouTube, mobile money (p.136–142)." },
  ] },
  { id: "u17", level: "Advanced", title: "Society and economy", summary: "Civic life, rights and money.", lessons: [
    { id: "u17-l1", title: "Government and rights", goal: "I can discuss civic topics.", plan: "Government, leader, justice, human rights, peace, voting, corruption, citizens (p.143–156)." },
    { id: "u17-l2", title: "Economy", goal: "I can discuss money and work.", plan: "Bank, loan, business, profit, export, import, poverty, insurance, credit." },
  ] },
  { id: "u18", level: "Advanced", title: "Language, arts and activities", summary: "Grammar terms, arts, sport and clubs.", lessons: [
    { id: "u18-l1", title: "Talking about language", goal: "I can name grammar terms.", plan: "Nouns, verbs, adjectives, sentence, spelling, dictionary, grammar (p.104–110, 158–159)." },
    { id: "u18-l2", title: "Arts, sport and clubs", goal: "I can talk about activities.", plan: "Music, drama, dance, poem, team, club, debate, award, certificate, run, warm up (p.111–114, 163–165)." },
  ] },
  { id: "u19", level: "Advanced", title: "Stories and the national anthem", summary: "Understand longer signing and perform the anthem.", lessons: [
    { id: "u19-l1", title: "Karara's story", goal: "I can follow a short signed story.", plan: "Scenario 1 from the manual (p.168)." },
    { id: "u19-l2", title: "James's journey", goal: "I can follow a longer story with places and dates.", plan: "Scenario 2 from the manual (p.168–169)." },
    { id: "u19-l3", title: "Rwanda Nziza", goal: "I can sign the national anthem.", plan: "National anthem in RSL (p.170)." },
  ] },
];

export const ALL_LESSONS = COURSE.flatMap(u => u.lessons.map(l => ({ ...l, unit: u })));
export const isReady = (l: LessonDef) => !!(l.signs?.length || l.spell?.length || l.numbers?.length || l.phrases?.length);
export const findLesson = (id: string) => ALL_LESSONS.find(l => l.id === id);
