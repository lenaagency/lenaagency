import type { ExportTitle } from "@/lib/types";

/**
 * Titles that should appear on /export even before the live For-sales
 * sheet row exists. Dropped automatically once the same `id` is on the sheet.
 */
export const PENDING_EXPORT_TITLES: ExportTitle[] = [
  {
    id: "land-you-the-museum-italy",
    title: "We Lend You the Museum: Italy",
    titleKo: "미술관을 빌려드립니다: 이탈리아",
    author: "이지안",
    authorEn: "Jian Lee",
    author2: "이정우",
    author2En: "Jung-woo Lee",
    category: "arts",
    categoryLabel: "Arts",
    categoryLabelKo: "예술/미술",
    categories: ["arts", "essay"],
    categoryLabels: ["Arts", "Essay"],
    categoryLabelsKo: ["예술/미술", "에세이"],
    series: "We Lend You the Museum",
    seriesKo: "미술관을 빌려드립니다",
    publisher: "더블북",
    publisherEn: "Doublebook",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 368,
    pubYear: 2026,
    pubMonth: 1,
    age: "",
    coverCopy:
      "An invitation to Italy’s alluring, unfamiliar masterpieces · Ten museums from Milan to Naples · Docent Jian Lee × editor Jung-woo Lee",
    coverCopyKo:
      "매혹적이고 낯선 이탈리아 명화의 초대 · 밀라노 브레라에서 나폴리 카포디몬테까지 · 도슨트 이지안 × 에디터 이정우",
    synopsis:
      "Too often a trip to the Uffizi ends with a photo in front of <i>The Birth of Venus</i> and little else. This volume is a guide to looking properly—what to see, and how to see it, in Italy’s museums.<br /><br />Docent and art therapist Jian Lee and contemporary-art editor Jung-woo Lee lead a north-to-south tour of ten museums, from Milan’s Pinacoteca di Brera to Naples’ Museo di Capodimonte, including the Uffizi, the Vatican Museums, the Galleria Borghese, and Venice’s Peggy Guggenheim Collection.<br /><br />A grand tour in a single book: Renaissance masters, the Macchiaioli, and Italy’s modern and contemporary experiments, with the stories that make the rooms breathe.",
    synopsisKo:
      "우피치에 가서도 무엇이 무엇인지 모른 채 〈비너스의 탄생〉 앞에서 인증샷만 찍고 나오는 아쉬움. 그 빈자리를 채우는 이탈리아 미술관 안내서다.<br /><br />명화 속 심리를 읽는 도슨트 이지안과 현대미술 에디터 이정우가 북부 밀라노에서 남부 나폴리까지, 반드시 보고 제대로 알아야 할 작품을 골라 안내한다. 우피치, 바티칸, 브레라는 물론 보르게세, 베네치아 구겐하임, 카포디몬테까지.<br /><br />고전부터 현대까지 이탈리아 미술의 흐름을 한 권에 담은, 책으로 떠나는 그랜드 투어.",
    authorBio:
      "Jian Lee is a museum docent and art therapist who reads psychology in masterpieces. She studied at Hanyang University and completed a master’s in clinical art therapy at CHA University. She has led tours at the Seoul Arts Center and My Art Museum, and works as an art therapist for “A Healing Walk Among Paintings” at Seoul National University Bundang Hospital’s cancer center. She lectures with Kyobo, Hana Tour, and Walkerhill Hotel on museum healing tours, and hosts a contemporary-exhibition segment on KBS Radio 1. She is the founder of Healing Museum.",
    authorBioKo:
      "명화 속 심리를 읽는 미술치료사 도슨트. 한양대학교와 CHA의과학대학교 미술치료대학원을 졸업하고 미술관 미술치료 연구와 현장 활동에 매진하고 있다. 예술의전당, 마이아트뮤지엄 전시해설 도슨트이자 분당서울대병원 암센터 ‘치유의 그림산책’ 아트테라피스트로, 단순한 미술사를 넘어 명화 속 심리를 읽는 해설로 위안을 전한다. 교보문고·하나투어·워커힐호텔과 ‘마음으로 가는 미술관’ 강연과 해외 미술관 힐링아트투어를 진행하며, KBS 1라디오에서 ‘요즘 전시’를 진행한다. 치유의 미술관 대표.",
    authorBio2:
      "Jung-woo Lee is a contemporary-art editor who believes art is completed in conversation. He has planned and written story-driven art content as chief editor of <i>Culture & Art for You</i> and is now editor-in-chief of the contemporary-art web magazine <i>BidPiece</i>. He is the author of <i>The Secret of Paintings People Queue For</i>, a regular panelist on SBS Radio’s <i>Mokdon Research Lab</i>, and writes the Kyobo column “Art History Through Relationships.”",
    authorBio2Ko:
      "예술을 읽고 쓰는 현대미술 에디터. ‘예술의 가치는 대화로 완성된다’고 믿으며, 단순한 설명을 넘어 예술 속 이야기를 삶의 언어로 풀어내는 콘텐츠를 기획·집필해 왔다. 『널 위한 문화예술』 치프 에디터를 거쳐 현재 현대미술 웹매거진 『빋피 BidPiece』 편집장으로 일한다. 예술가 브랜딩을 다룬 『줄 서서 보는 그림의 비밀』을 썼고, SBS 라디오 《목돈연구소》 고정 패널이자 교보문고 칼럼 「관계로 보는 미술사」를 연재한다.",
    colors: ["#1a4a32", "#e8d48b"],
    featured: false,
    new: true,
    cover: "/covers/land-you-the-museum-italy.jpg",
  },
  {
    id: "land-you-the-museum-nordic",
    title: "We Lend You the Museum: Northern Europe",
    titleKo: "미술관을 빌려드립니다: 북유럽",
    author: "손봉기",
    authorEn: "Bonggi Son",
    category: "arts",
    categoryLabel: "Arts",
    categoryLabelKo: "예술/미술",
    categories: ["arts", "essay"],
    categoryLabels: ["Arts", "Essay"],
    categoryLabelsKo: ["예술/미술", "에세이"],
    series: "We Lend You the Museum",
    seriesKo: "미술관을 빌려드립니다",
    publisher: "더블북",
    publisherEn: "Doublebook",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 340,
    pubYear: 2024,
    pubMonth: 3,
    age: "",
    coverCopy:
      "Painters who loved the happiness of everyday life · From Carl Larsson to Munch · 41 Nordic artists and more than 100 works",
    coverCopyKo:
      "일상의 행복을 사랑한 화가들 · 칼 라르손부터 뭉크까지 · 북유럽 4개국 41명의 화가와 100여 점의 작품",
    synopsis:
      "Ordinary moments become poems, and poems become paintings. This volume gathers the warm gaze of Nordic artists who, amid snowfields and glaciers, chose to love the happiness of everyday life.<br /><br />From Sweden’s national painter Carl Larsson to Norway’s Edvard Munch, Denmark’s Peder Severin Krøyer, and Finland’s Albert Edelfelt—a European museum docent of more than 25 years guides readers through 41 artists and over 100 works, as if leading a private tour.<br /><br />A rare invitation to borrow a Nordic museum in a single book: Larsson’s intimate watercolors that later inspired IKEA’s design roots, Munch’s portraits of the inner self, and a region of art still little known in Korea.",
    synopsisKo:
      "평범한 순간이 시가 되고 그림이 되다. 설산과 빙하로 둘러싸인 척박한 환경 속에서도 일상의 행복을 사랑한 북유럽 화가들의 따뜻한 시선을 한 권에 담았다.<br /><br />스웨덴 국민 화가 칼 라르손부터 노르웨이의 에드바르 뭉크, 덴마크의 페데르 세베린 크뢰위에르, 핀란드의 알베르트 에델펠트까지. 25년 이상 유럽 현지 미술관에서 도슨트로 활동해 온 저자가 북유럽 4개국 41명의 화가와 100여 점의 작품을, 실제 전시를 안내하듯 풀어낸다.<br /><br />이케아 디자인의 뿌리가 된 라르손의 아늑한 수채화부터 인간의 내면을 그린 뭉크까지, 국내에서 접하기 힘들었던 북유럽 미술을 책 한 권으로 빌려 보는 특별한 초대.",
    authorBio:
      "Bonggi Son has worked as a museum and gallery docent around the world for 26 years. He has led more than 100 tours at major institutions including the British Museum, the Louvre, the Vatican Museums, the Hermitage, and New York’s Metropolitan Museum of Art and American Museum of Natural History. Moved by the Greek galleries at the British Museum, he has offered free audio guides to Europe’s five great museums for 20 years. He also runs a travel company and lectures on museums, art, and travel at universities, public offices, and companies. His books include <i>We Lend You the Museum: Northern Europe</i>, <i>101 European Travel Bucket List</i>, and <i>52 Things Not to Miss in Europe</i>.",
    authorBioKo:
      "전 세계 박물관과 미술관에서 26년째 도슨트로 활동 중이다. 대영박물관, 루브르, 바티칸 박물관, 에르미타주, 뉴욕 메트로폴리탄 박물관과 자연사박물관 등에서 100회 이상 가이드를 진행했다. 대영박물관 그리스 전시관에서 받은 감동을 더 많은 사람과 나누고자 유럽 5대 박물관 해설을 음성 파일로 제작해 20년째 무료로 배포하고 있다. 현재 여행사를 운영하며 대학교, 관공서, 대기업 등에서 박물관·미술관·여행을 주제로 강의한다. 저서로 《미술관을 빌려드립니다 : 북유럽》, 《유럽여행 버킷리스트 101》, 《유럽여행 가서 빼먹지 말아야 할 52가지》 등이 있다.",
    colors: ["#1e3a70", "#c9b896"],
    featured: false,
    new: true,
    cover: "/covers/land-you-the-museum-nordic.jpg",
    previewImages: [
      "/previews/land-you-the-museum-nordic/1.jpg",
      "/previews/land-you-the-museum-nordic/2.jpg",
      "/previews/land-you-the-museum-nordic/3.jpg",
      "/previews/land-you-the-museum-nordic/4.jpg",
    ],
  },
];

export function withPendingExportTitles(titles: ExportTitle[]): ExportTitle[] {
  const ids = new Set(titles.map((t) => t.id));
  const extra = PENDING_EXPORT_TITLES.filter((t) => !ids.has(t.id));
  return extra.length ? [...extra, ...titles] : titles;
}
