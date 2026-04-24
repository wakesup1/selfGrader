// Shared mock data for nograder

window.NG_DATA = {
  user: { name: "Weeraphat P.", handle: "a68_weep", role: "student", solved: 147, streak: 12 },

  topics: [
    { id: "all", label: "All" },
    { id: "algo", label: "Algorithms" },
    { id: "data", label: "Data Structures" },
    { id: "diglo", label: "DigLog" },
    { id: "db", label: "Database" },
    { id: "prog", label: "ProgMeth" },
    { id: "hwsyn", label: "HWSyn" },
  ],

  difficulties: ["Easy", "Medium", "Hard", "Extra"],

  problems: [
    { id: "fed_y_2", num: "a68_q3b", name: "FED-Y-2", topic: "algo", difficulty: "Medium", score: 100, tries: 8, status: "accepted", brewed: "Signature", lastSub: "21h", solved: 312, pts: 120 },
    { id: "normal_puzzle", num: "a68_q4a", name: "Normal Puzzle", topic: "algo", difficulty: "Medium", score: 80, tries: 13, status: "partial", brewed: "Seasonal", lastSub: "21h", solved: 204, pts: 100 },
    { id: "strange_pictures", num: "a68_q4a", name: "Strange Pictures", topic: "data", difficulty: "Hard", score: 100, tries: 13, status: "accepted", brewed: "House", lastSub: "21h", solved: 88, pts: 180 },
    { id: "goat_duel", num: "a68_q4z", name: "The Goat Duel", topic: "algo", difficulty: "Hard", score: 100, tries: 1, status: "accepted", brewed: "Rare", lastSub: "4d", solved: 46, pts: 220 },
    { id: "guitar_array_3", num: "a68_q4z", name: "Guitar's Array 3", topic: "data", difficulty: "Medium", score: 57.5, tries: 17, status: "partial", brewed: "Signature", lastSub: "2d", solved: 97, pts: 140 },
    { id: "latte_tree", num: "a68_q5a", name: "Latte Tree", topic: "data", difficulty: "Easy", score: 100, tries: 3, status: "accepted", brewed: "House", lastSub: "6d", solved: 428, pts: 60 },
    { id: "espresso_sort", num: "a68_q5b", name: "Espresso Sort", topic: "algo", difficulty: "Easy", score: 0, tries: 0, status: "unattempted", brewed: "House", lastSub: "—", solved: 501, pts: 40 },
    { id: "moonlight_flip", num: "a68_q6a", name: "Moonlight Flip Flop", topic: "hwsyn", difficulty: "Hard", score: 0, tries: 2, status: "wrong", brewed: "Rare", lastSub: "3d", solved: 22, pts: 240 },
    { id: "query_garden", num: "a68_q7a", name: "Query Garden", topic: "db", difficulty: "Medium", score: 100, tries: 4, status: "accepted", brewed: "Signature", lastSub: "1w", solved: 133, pts: 110 },
    { id: "pour_over_dp", num: "a68_q7c", name: "Pour-Over DP", topic: "algo", difficulty: "Extra", score: 30, tries: 21, status: "partial", brewed: "Rare", lastSub: "12h", solved: 9, pts: 300 },
    { id: "oat_milk_oop", num: "a68_q8a", name: "Oat Milk OOP", topic: "prog", difficulty: "Easy", score: 100, tries: 2, status: "accepted", brewed: "House", lastSub: "9d", solved: 389, pts: 70 },
    { id: "kraft_graph", num: "a68_q8b", name: "Kraft Paper Graph", topic: "data", difficulty: "Medium", score: 100, tries: 6, status: "accepted", brewed: "Signature", lastSub: "11d", solved: 156, pts: 130 },
    { id: "morning_light_mod", num: "a68_q9a", name: "Morning Light Modulo", topic: "diglo", difficulty: "Medium", score: 100, tries: 7, status: "accepted", brewed: "House", lastSub: "2d", solved: 211, pts: 100 },
    { id: "barista_queue", num: "a68_q9b", name: "Barista's Queue", topic: "data", difficulty: "Easy", score: 0, tries: 0, status: "unattempted", brewed: "House", lastSub: "—", solved: 612, pts: 50 },
  ],

  announcements: [
    {
      id: "a1",
      tag: "Quiz",
      title: "Quiz 4 — Dynamic Programming",
      body: "ข้อ Normal Puzzle ตอนตารางเป็น 2 * 2 (ก็คือ N == 2) เขียน if มา 24 แบบจะได้ 30 คะแนน แนะนำให้คิดด้วย 'มือ' ได้เลย ต่อเวลาไป 15 นาที",
      updated: "1 day ago",
      pinned: true,
    },
    {
      id: "a2",
      tag: "Data",
      title: "Homework Test Data Released",
      body: "Test Data ชุดใหม่สำหรับ Algo 25/b อัพโหลดแล้ว ตรวจ input boundary ให้ดีก่อนส่งครับ",
      updated: "12 days ago",
    },
    {
      id: "a3",
      tag: "Hint",
      title: "Quiz 3 Hint (11:15)",
      body: "Remaining Merge 2 ลอง pseudocode ให้ถูกแล้วนับจำนวนครั้งตรงๆ ได้กี่ครั้ง ก็ 55/100 แล้วครับ",
      updated: "22 days ago",
    },
    {
      id: "a4",
      tag: "Notice",
      title: "ประกาศ Quiz 2 Algo 25/b",
      body: "Hint AI Assist วันนี้ท่าน Claude 'ง่วง' ไม่เจ็บแล้วครับ (แต่อาจเจ๋งกว่าปกติ)",
      updated: "24 days ago",
    },
  ],

  hallOfFame: [
    { rank: 1, handle: "a67_nottm", name: "Nathapol M.", roast: "Dark Roast", solved: 412, streak: 87, origin: "CPE '23", notes: "Nearly untouchable on DP problems — solved Pour-Over DP in one go." },
    { rank: 2, handle: "a66_fahk",  name: "Phakin L.",   roast: "Medium Dark", solved: 398, streak: 54, origin: "CPE '22", notes: "Specialty: graph theory & flow." },
    { rank: 3, handle: "a68_ninez", name: "Naraphat C.", roast: "Medium",      solved: 381, streak: 41, origin: "CPE '24", notes: "Rising star. First-year, already in top 3." },
    { rank: 4, handle: "a67_minmin", name: "Mintra J.",  roast: "Medium",      solved: 364, streak: 29, origin: "CPE '23", notes: "Queen of clean code." },
    { rank: 5, handle: "a66_bigp",  name: "Pattara N.",  roast: "Light",       solved: 351, streak: 22, origin: "CPE '22", notes: "Loves hardware synthesis problems." },
    { rank: 6, handle: "a68_fern",  name: "Fernanda S.", roast: "Medium Light", solved: 338, streak: 18, origin: "CPE '24", notes: "Consistent top submissions on DB track." },
    { rank: 7, handle: "a67_kaze",  name: "Kazuto H.",   roast: "Medium",      solved: 327, streak: 15, origin: "CPE '23", notes: "Strong algo fundamentals." },
    { rank: 8, handle: "a65_orn",   name: "Ornthicha R.", roast: "Dark Roast", solved: 319, streak: 12, origin: "CPE '21", notes: "Returning alum, helps grade weekend quizzes." },
    { rank: 9, handle: "a68_weep",  name: "Weeraphat P.", roast: "Medium",     solved: 147, streak: 12, origin: "CPE '24", notes: "You. Keep going." },
  ],

  submissions: [
    { id: "913715", problem: "FED-Y-2", problemId: "fed_y_2", verdict: "Accepted", score: 100, time: "21h ago", date: "22/04/26 16:39:53", tries: 8, lang: "C++17", runtime: "0.12s", mem: "2.1MB" },
    { id: "913662", problem: "Normal Puzzle", problemId: "normal_puzzle", verdict: "Partial", score: 80, time: "21h ago", date: "22/04/26 14:19:09", tries: 13, lang: "C++17", runtime: "0.08s", mem: "1.8MB" },
    { id: "913672", problem: "Strange Pictures", problemId: "strange_pictures", verdict: "Accepted", score: 100, time: "21h ago", date: "22/04/26 16:17:53", tries: 13, lang: "C++17", runtime: "0.21s", mem: "4.2MB" },
    { id: "907036", problem: "The Goat Duel", problemId: "goat_duel", verdict: "Accepted", score: 100, time: "4d ago", date: "19/04/26 20:40:41", tries: 1, lang: "Python 3.12", runtime: "0.44s", mem: "14MB" },
    { id: "909375", problem: "Guitar's Array 3", problemId: "guitar_array_3", verdict: "Partial", score: 57.5, time: "2d ago", date: "21/04/26 13:41:55", tries: 17, lang: "C++17", runtime: "0.91s", mem: "6.8MB" },
    { id: "903102", problem: "Moonlight Flip Flop", problemId: "moonlight_flip", verdict: "Wrong Answer", score: 0, time: "3d ago", date: "20/04/26 09:12:00", tries: 2, lang: "Verilog", runtime: "—", mem: "—" },
    { id: "902018", problem: "Pour-Over DP", problemId: "pour_over_dp", verdict: "Partial", score: 30, time: "12h ago", date: "22/04/26 22:10:12", tries: 21, lang: "C++17", runtime: "1.24s", mem: "18MB" },
    { id: "901445", problem: "Latte Tree", problemId: "latte_tree", verdict: "Accepted", score: 100, time: "6d ago", date: "17/04/26 19:22:07", tries: 3, lang: "C++17", runtime: "0.05s", mem: "1.2MB" },
  ],
};

// verdict helpers
window.NG_HELPERS = {
  verdictChip(v) {
    if (v === "Accepted") return "chip-sage";
    if (v === "Partial") return "chip-amber";
    return "chip-clay";
  },
  statusLabel(s) {
    return { accepted: "brewed", partial: "steeping", wrong: "burnt", unattempted: "on menu" }[s] || s;
  },
  statusChip(s) {
    return { accepted: "chip-sage", partial: "chip-amber", wrong: "chip-clay", unattempted: "chip" }[s] || "chip";
  },
};
