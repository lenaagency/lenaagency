import type { ExportTitle } from "@/lib/types";

/**
 * Titles that should appear on /export even before the live For-sales
 * sheet row exists. Dropped automatically once the same `id` is on the sheet.
 */
export const PENDING_EXPORT_TITLES: ExportTitle[] = [
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
