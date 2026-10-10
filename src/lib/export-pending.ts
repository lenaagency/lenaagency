import type { ExportTitle } from "@/lib/types";

/**
 * Titles that should appear on /export even before the live For-sales
 * sheet row exists. Dropped automatically once the same `id` is on the sheet.
 */
export const PENDING_EXPORT_TITLES: ExportTitle[] = [
  {
    id: "aic-im-upset",
    title: "When I Say Ai-C, I'm Upset!",
    titleKo: "아이C 하면 아이고, 속상해!",
    author: "고지혜",
    authorEn: "Jihye Ko",
    author2: "오우성",
    author2En: "Woosung Oh",
    category: "picturebook",
    categoryLabel: "Picture Books",
    categoryLabelKo: "그림책",
    categories: ["picturebook"],
    categoryLabels: ["Picture Books"],
    categoryLabelsKo: ["그림책"],
    publisher: "촘촘북스",
    publisherEn: "Chunchum Books",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 60,
    bookSize: "205 × 255 mm",
    pubYear: 2026,
    pubMonth: 10,
    age: "4–8",
    coverCopy:
      "What is hiding behind “Ai-C”? · Look at the feeling before you scold the words",
    coverCopyKo:
      "“아이C!”라는 말 뒤에 숨은 진짜 마음은 무엇일까? · 혼내기 전에 그 말 속 감정부터",
    synopsis:
      "Kids spit out “Ai-C!” when they are angry, jealous, bored, or just done. Grown-ups hear a bad word and scold. The book starts one step earlier: that sound is not a swear. It is “ai” plus “sshi,” a grunt of not-wanting, and a whole weather system of feeling packed into one syllable.<br /><br />Whenever Myeonghun says it, odd little creatures pop out of the air. At first they only scare him. Then he traces each one back—to a test he might fail, a prize a friend won, a classmate who moved away, a class that would not end, a flash of temper he already regrets. The question shifts from “Why did I say that?” to “What am I feeling right now?”<br /><br />A fantasy picture book for children and the adults beside them. Feelings have no correct answer. Naming them, in words that actually fit, is how a child starts to share a heart.",
    synopsisKo:
      "화가 나거나 속상할 때 아이들이 무심코 내뱉는 말, “아이C!” 어른은 먼저 혼낸다. 이 책은 그 한 걸음 앞에서 시작한다. 욕이 아니다. ‘아이’와 ‘씨’가 붙인 소리일 뿐인데, 그 뒤에 화·놀람·짜증·서운함·질투·스트레스가 뭉뚱그려져 있다.<br /><br />주인공 명훈이가 그 말을 할 때마다 이상한 녀석들이 나타난다. 처음엔 귀찮고 무서울 뿐이다. 언제 생겼는지 하나씩 떠올려 보니, 시험을 망칠까 봐 불안했던 마음, 친구가 상을 받아 부러웠던 마음, 이별의 슬픔, 따분함, 화내고 난 뒤의 미안함이 보인다. “내가 왜 이런 말을 했을까?”가 “나 지금 어떤 기분이지?”로 바뀐다.<br /><br />아이 혼자 읽는 판타지이자, 부모·교사가 아이 마음을 물어볼 출발점. 감정에는 정답이 없다. 알아차리고, 맞는 말로 표현하는 일이 마음을 나누는 첫걸음이다.",
    authorBio:
      "Jihye Ko studied early-childhood education at Ewha Womans University and child and family studies at Yonsei University graduate school. She works as a picture-book editor-planner, writer, picture-book therapist, and reading guide, connecting books with children. Words, she says, are the bridge between people; she wrote the <i>In My Words</i> series hoping children will build that bridge firmly enough to keep using it as adults. Her books include <i>Pretend Play Is Fun!</i> and <i>I Can Do It Too!</i>.",
    authorBioKo:
      "이화여자대학교에서 유아교육을, 연세대학교 대학원에서 아동가족학을 공부했다. 그림책 기획자이자 작가, 그림책 테라피스트, 독서지도사로 그림책과 아이들을 잇는다. 말은 사람을 연결하는 다리라고 생각하며, 그 다리를 아이들이 단단히 만들어 어른이 되어서도 마음을 나누길 바라는 마음으로 《나의 말 속에는》 시리즈를 썼다. 저서 『상상 놀이는 즐거워!』, 『나도 할 수 있어!』.",
    authorBio2:
      "Woosung Oh draws the twin characters Ore and Oo, and posts the four-panel strip <i>Pretty Decent Distractions</i> on social media. Books he illustrated include <i>The Dragon Is Money</i>, <i>The Jam Lid That Will Not, Will Not Open</i>, and <i>Elementary Hanja Vocabulary Daily Calendar</i>; books he wrote and drew include <i>How About Twins Like These?</i>, <i>Ore-Oo Find the Difference in Famous Paintings</i>, and <i>Ore-Oo and Fine Dust</i>. Instagram @OLAOO_WS.",
    authorBio2Ko:
      "‘오레’와 ‘오오’ 쌍둥이 캐릭터로 유쾌하고 별난 생각을 그리며, SNS에 네 컷 만화 〈꽤 괜찮은 딴생각〉을 연재한다. 그린 책으로 『용이 돈이』, 『절대 절대 안 열리는 잼 뚜껑』, 『초등 한자 어휘 일력』 등이 있고, 쓰고 그린 책으로 『이런 쌍둥이 어때요?』, 『오레오오 명화 다른 그림 찾기』, 『오레오오와 미세먼지』 등이 있다. 인스타그램 @OLAOO_WS.",
    colors: ["#f4d21a", "#3bb54c"],
    featured: false,
    new: true,
    cover: "/covers/aic-im-upset.jpg",
  },
  {
    id: "yoriharu-habit-diet",
    title: "Yoriharu's Habit Diet",
    titleKo: "요리하루의 습관 다이어트",
    author: "요리하루(김민지)",
    authorEn: "Yoriharu (Minji Kim)",
    category: "lifestyle",
    categoryLabel: "Lifestyle/Health",
    categoryLabelKo: "실용/건강",
    categories: ["lifestyle"],
    categoryLabels: ["Lifestyle/Health"],
    categoryLabelsKo: ["실용/건강"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 352,
    pubYear: 2026,
    pubMonth: 7,
    age: "",
    coverCopy:
      "Stop white-knuckling the diet · 110 real home-cooking recipes that keep cravings from breaking you · 140,000 Instagram followers",
    coverCopyKo:
      "참는 다이어트는 이제 그만 · 속세의 맛으로 입 터짐을 막는 집밥 레시피 110 · 인스타그램 14만 팔로워",
    synopsis:
      "Start a diet and the mind jumps to chicken breast, salad, sweet potato. Hold out long enough against the food you actually want, and appetite turns into obsession—then binge, then yo-yo.<br /><br />Cooking creator Yoriharu (Minji Kim), followed by 140,000 readers, landed on one rule after years of trial: a diet has to taste good enough to last. Fruit-and-vegetable plates, protein that actually fills, side dishes that stop a craving from blowing the week, one-bowl meals, and desserts you can reach for instead of delivery—110 recipes of ordinary house cooking.<br /><br />The book is as much habit as recipe: how to sit with hunger, how to start again after a slip, how to find a meal pattern that fits a real life. The question is not what to eat once. It is how to keep eating.",
    synopsisKo:
      "다이어트를 시작하면 닭가슴살과 샐러드, 고구마부터 떠올린다. 먹고 싶은 음식을 계속 참으면 식욕은 집착이 되고, 폭식과 요요로 이어지기 쉽다.<br /><br />인스타그램 14만 팔로워와 소통해 온 요리 크리에이터 요리하루(김민지)가 내린 결론은 하나다. 다이어트는 맛있게 먹으면서도 오래 갈 수 있어야 한다. 과채소, 든든한 단백질, 입 터짐을 막는 반찬, 한 그릇 요리, 건강 디저트까지 집밥 레시피 110가지.<br /><br />레시피만이 아니다. 공복 관리, 실패 후 다시 시작하기, 자기 패턴 찾기 등 습관 다이어트 노하우를 함께 담았다. ‘무엇을 먹을까’보다 ‘어떻게 이어갈까’에 집중한 책이다.",
    authorBio:
      "Yoriharu (Minji Kim) shares home cooking that tastes good without packing on weight with 140,000 Instagram followers. Taste comes first—she would rather be hungry than eat something dull—and she treats variety itself as part of staying well. This first book gathers the stories and know-how that would not fit in a short Reel, written as if she were standing next to the reader at the stove.",
    authorBioKo:
      "인스타그램에서 맛있게 살 안 찌는 집밥을 14만 팔로워와 공유한다. 첫 번째도 맛, 두 번째도 맛. 배고픈 건 참아도 맛없는 건 못 참을 만큼 맛을 우선하고, 다양한 집밥을 경험하는 일 자체를 중요하게 본다. 짧은 릴스에 다 담지 못한 이야기와 노하우를 이 책에 모아, 요리하며 혼자 고민하는 순간이 없도록 옆에서 알려 주듯 썼다.",
    colors: ["#e23c2b", "#f4efe6"],
    featured: false,
    new: true,
    cover: "/covers/yoriharu-habit-diet.jpg",
  },
  {
    id: "thepos-swim-lessons",
    title: "THE POS Hyunlee-ssaem's Essential Swim Lessons",
    titleKo: "더포스 현이쌤의 알짜 수영 레슨",
    author: "이현이",
    authorEn: "Hyunlee Lee",
    category: "lifestyle",
    categoryLabel: "Lifestyle/Health",
    categoryLabelKo: "실용/건강",
    categories: ["lifestyle"],
    categoryLabels: ["Lifestyle/Health"],
    categoryLabelsKo: ["실용/건강"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 296,
    pubYear: 2026,
    pubMonth: 6,
    age: "",
    coverCopy:
      "Why isn’t my swimming improving? · Korea’s No. 1 swim channel THE POS · 870,000 subscribers · From a former national-team reserve",
    coverCopyKo:
      "“왜 내 수영은 늘 제자리걸음일까?” · 대한민국 No.1 수영 채널 더포스 · 구독자 87만 · 국가대표 상비군 출신 현이쌤",
    synopsis:
      "Kicking hard and still sinking. Swallowing water every time you turn to breathe. Swimming stalls not from a lack of fitness but from a few missed details you cannot see in the water.<br /><br />Hyunlee Lee—thirty years in the pool, a former national-team reserve, and coach of THE POS, Korea’s most-watched swimming channel—shot every still and video herself so beginners can watch a stroke in slow motion. Freestyle, backstroke, breaststroke, butterfly: kicks, pulls, and waves broken into master drills, with QR codes that open the matching clip at the poolside.<br /><br />Gear, pool manners, and the questions coaches hear forever (“Will swimming broaden my shoulders?”) sit beside race-prep notes for masters swimmers. A coaching book meant to be used wet.",
    synopsisKo:
      "열심히 발차기를 해도 하체가 가라앉고, 숨 쉴 때마다 물을 삼킨다. 수영이 늘지 않는 이유는 체력이 부족해서가 아니라, 물속에서 스스로 볼 수 없는 작은 디테일을 놓치고 있기 때문이다.<br /><br />수영 경력 30년, 국가대표 상비군 출신이자 대한민국 No.1 수영 채널 〈더포스 수영〉 코치 이현이가 모든 사진과 영상을 직접 찍었다. 자유형·배영·평영·접영의 발차기·팔 돌리기·웨이브를 마스터 드릴로 쪼개고, QR코드로 시범 영상을 바로 확인한다.<br /><br />장비와 수영장 매너, “수영하면 어깨 넓어지나요?” 같은 현장 질문부터 마스터즈 대회를 준비하는 사람을 위한 팁까지. 수영장에서 펼쳐 쓰는 코칭북이다.",
    authorBio:
      "Hyunlee Lee has lived in the water since she was five. A former national-team reserve, she medaled at the National Sports Festival, studied sports coaching at Kyung Hee University, and swam for the Ulsan City team (2011–2014). She later coached for the Hwaseong Swimming Federation, led Team THE POS Masters, and was head coach at swim21. She holds a Level-2 professional instructor certificate in swimming, Red Cross lifeguard credentials, and a Level-3 judging license. She now teaches through the YouTube channel THE POS (The Point of Swimming). Instagram: @the___pos / @swim_hyunlee.",
    authorBioKo:
      "다섯 살에 수영을 시작해 30년 가까이 물속에서 살아 온 수영인. 국가대표 상비군 출신으로 소년체전과 전국체전에서 다수의 메달을 땄고, 서울체육고를 나와 경희대 스포츠지도학을 전공한 뒤 울산시청 실업팀(2011~2014)에서 선수 생활을 했다. 화성시 수영연맹 부코치, Team THE POS 마스터즈팀 대표, swim21 헤드코치를 지냈다. 전문 지도자 2급(수영), 대한적십자 수상인명구조사, 수영 심판 3급. 지금은 유튜브 〈더포스 수영〉으로 핵심을 전한다. 인스타그램 더포스 @the___pos / 현이쌤 @swim_hyunlee.",
    colors: ["#1a7fd4", "#f5c400"],
    featured: false,
    new: true,
    cover: "/covers/thepos-swim-lessons.jpg",
  },
  {
    id: "write-nietzsche",
    title: "When Life Shakes, Write Nietzsche",
    titleKo: "삶이 흔들릴 때 니체를 쓴다",
    author: "이인",
    authorEn: "In Lee",
    category: "humanities",
    categoryLabel: "Humanities/Social Science",
    categoryLabelKo: "인문/사회",
    categories: ["humanities"],
    categoryLabels: ["Humanities/Social Science"],
    categoryLabelsKo: ["인문/사회"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 220,
    pubYear: 2026,
    pubMonth: 1,
    age: "",
    coverCopy:
      "100 Nietzsche sentences · commentary · a question for you · Five movements: chaos, wound, solitude, recovery, will",
    coverCopyKo:
      "니체 철학을 가장 쉽게 이해하는 방법 — 100문장 + 해설 + 사유 질문 · 혼돈·상처·고독·회복·의지",
    synopsis:
      "When the ground under a life shifts, Nietzsche’s short lines still hold. This is not a book for collecting a sage’s quotes. It is a hundred-day practice: read a sentence, follow the commentary, then answer a question in your own words.<br /><br />In Lee, who has taught philosophy for more than ten years, draws from <i>Untimely Meditations</i>, <i>Twilight of the Idols</i>, <i>The Gay Science</i>, <i>Thus Spoke Zarathustra</i>, and other major texts, and rearranges them into five movements—chaos, wound, solitude, recovery, will.<br /><br />Nietzsche does not hand over answers. He hands over questions that change the person who stays with them.",
    synopsisKo:
      "삶의 방향을 잃기 쉬운 순간, 니체의 짧은 문장은 여전히 가장 단단한 기준점을 준다. 명언을 모아 두기 위한 책이 아니다. 문장을 읽고, 해설로 이해한 뒤, 나에게 묻는 질문에 짧게 답하는 100일의 실천이다.<br /><br />10년 넘게 철학을 강의해 온 이인이 『반시대적 고찰』, 『우상의 황혼』, 『즐거운 학문』, 『차라투스트라는 이렇게 말했다』 등에서 핵심 문장 100개를 골라, 혼돈·상처·고독·회복·의지의 다섯 단계로 다시 짰다.<br /><br />니체는 답을 주지 않는다. 대신 나를 바꾸는 질문을 건넨다.",
    authorBio:
      "In Lee writes from a love of living. He lectures on the humanities and on writing. His books include <i>Zero-Base Philosophy, Read Lazily</i>, <i>How to Cross Solitude</i>, <i>The Night of a Life</i>, <i>My Prickly Unemployed Grandmother</i>, and <i>I Am Uncomfortable with Myself</i>.",
    authorBioKo:
      "삶을 사랑하는 마음으로 글을 쓴다. 인문학 강연과 글쓰기 강의를 하며, 『게으르게 읽는 제로베이스 철학』, 『고독을 건너는 방법』, 『인생의 밤』, 『나의 까칠한 백수 할머니』, 『나는 내가 불편하다』 등을 썼다.",
    colors: ["#6b4a3a", "#e8dcc8"],
    featured: false,
    new: true,
    cover: "/covers/write-nietzsche.jpg",
  },
  {
    id: "emotion-copying",
    title: "Emotion Copying That Guards the Heart",
    titleKo: "내 마음을 지키는 감정 필사",
    author: "한경은",
    authorEn: "Kyeongeun Han",
    category: "psychology",
    categoryLabel: "Psychology",
    categoryLabelKo: "심리",
    categories: ["psychology"],
    categoryLabels: ["Psychology"],
    categoryLabelsKo: ["심리"],
    series: "",
    seriesKo: "",
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 248,
    pubYear: 2025,
    pubMonth: 11,
    age: "",
    coverCopy:
      "A real adult does not suppress feeling—they can work with it · 100 days of psychology, copying, and healing writing",
    coverCopyKo:
      "진짜 어른은 감정을 다스리는 게 아니라 다룰 줄 아는 사람이다 · 심리학·필사·치유 글쓰기 100일",
    synopsis:
      "Feelings too fine to name leave grit in the body. Some people would rather throw the feeling away. Counselor Kyeongeun Han’s reply is blunt: feeling is the self. To discard it is to discard yourself.<br /><br />A hundred days, five minutes a day. Copy one line from a philosopher, psychologist, or writer; read a short page of psychology; answer two questions. Five movements: recognize, accept, become the subject, live with others, care for yourself.<br /><br />The point is not to become someone who never feels. It is to become someone who can stay with a feeling until it is ready to leave.",
    synopsisKo:
      "말로 설명하기 어려운 감정은 마음의 티끌이 되어 몸 곳곳에 생채기를 낸다. 차라리 버리라고 말하는 이들에게, 심리상담가 한경은은 감정은 나이므로 감정을 버린다는 건 나를 버리는 일과 같다고 답한다.<br /><br />하루 5분, 100일. 철학자·학자·작가의 한 줄을 필사하고, 쉽게 쓴 심리학을 읽고, 두 개의 질문에 답한다. 감정 인식—수용—주체자 되기—타인과 함께 살기—자기돌봄의 다섯 단계.<br /><br />감정을 없애는 수업이 아니다. 손님이 떠나갈 때까지 함께 있을 줄 아는 사람이 되는 수업이다.",
    authorBio:
      "Kyeongeun Han is director of the Naru Institute for Integrative Arts Psychotherapy and holds a doctorate in integrative arts therapy. She runs counseling and consciousness-growth programs that help people meet existential pain as it is. Her books include <i>How to Hold On and How to Let Go</i>, <i>You Did Your Best Then</i>, and <i>No Thank You for Your Opinion</i>. Instagram @healing_naru.",
    authorBioKo:
      "통합예술심리상담연구소 나루 대표. 통합예술치료학 박사. 심리상담과 의식성장 프로그램을 운영하며 삶의 실존적 고통을 있는 그대로 마주할 힘을 기르도록 돕는다. 저서 『잡는 법과 놓는 법』, 『당신은 그때 최선을 다했다』, 『당신 생각은 사양합니다』. 인스타그램 @healing_naru.",
    colors: ["#3d7a4a", "#f5edd6"],
    featured: false,
    new: true,
    cover: "/covers/emotion-copying.jpg",
  },
  {
    id: "menopause-diet",
    title: "Teacher Jeon's Menopause Diet",
    titleKo: "전선생의 갱년기 다이어트",
    author: "전미란(전선생)",
    authorEn: "Miran Jeon",
    category: "lifestyle",
    categoryLabel: "Lifestyle/Health",
    categoryLabelKo: "실용/건강",
    categories: ["lifestyle"],
    categoryLabels: ["Lifestyle/Health"],
    categoryLabelsKo: ["실용/건강"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 252,
    pubYear: 2025,
    pubMonth: 7,
    age: "",
    coverCopy:
      "A tasty prescription for the turning point of menopause · 97 signature recipes · a 50-day program · −12 kg · 150,000 Instagram followers",
    coverCopyKo:
      "갱년기를 위한 맛있는 처방전 · 시그니처 레시피 97 · 50일 식단 프로그램 · −12kg · 인스타그램 15만",
    synopsis:
      "Insomnia, flushing, psoriasis, weight that will not move, joint pain. People call it age and wait. Menopause can last two years or ten, and the aftereffects often stay. Hormones from a clinic are a stopgap, not a life.<br /><br />Miran Jeon (Teacher Jeon), followed by 150,000 readers, met menopause early and found the lever in food. Ninety-seven recipes without seven common additives—homemade dressings, enzyme breakfasts, soups that skip a glucose spike, one-bowl lunches, sides and broths—plus a 50-day program that began as a 100-day challenge with her community. She herself lost more than 12 kg.<br /><br />Menopause, she says, is not a disease. It is a question. The first answer is a meal cooked for yourself.",
    synopsisKo:
      "불면증, 홍조, 건선, 체중 증가, 관절 통증. 사람들은 나이 탓이라며 기다리라고 한다. 갱년기는 2~3년에서 10년 이상 이어지고, 끝난 뒤에도 후유증이 남는 경우가 많다. 병원 호르몬제는 임시방편이다.<br /><br />인스타그램 15만 팔로워의 전미란(전선생)은 이른 갱년기를 식단으로 다독였다. 7가지 첨가물 없이 만드는 시그니처 레시피 97—홈메이드 드레싱, 효소 아침 샐러드, 혈당 스파이크 없는 수프, 한 그릇 점심, 국과 반찬—그리고 커뮤니티와 함께한 100일 도전에서 현실적으로 줄인 50일 프로그램. 저자 본인이 −12kg.<br /><br />갱년기는 병이 아니라 질문이다. 그 첫 대답은 나를 위해 한 끼를 차리는 일이다.",
    authorBio:
      "Miran Jeon (Teacher Jeon) met menopause earlier than most. She began recording every meal and building recipes that care for body and mind. After food changed her thinking—and her life—she started posting for women in the same season on Instagram and YouTube. Her line is that menopause is not a disease but a question: read the message the body is sending, then eat in a way you can sustain. Instagram @jeonskitchen_recipe · YouTube @jeonskitchen.",
    authorBioKo:
      "남들보다 조금 일찍 찾아온 갱년기를 계기로 매일 식사를 기록하며 몸과 마음을 돌보는 레시피를 만들었다. 먹거리의 변화가 생각의 전환으로 이어진 뒤, 인스타그램과 유튜브에 갱년기 여성을 위한 건강 식습관을 전한다. ‘갱년기는 병이 아니라 질문이다’라는 화두 아래, 하루 한 끼의 실천이 삶을 어떻게 바꾸는지 함께 증명하고 있다. 인스타그램 @jeonskitchen_recipe · 유튜브 @jeonskitchen.",
    colors: ["#e85d2a", "#f7efe4"],
    featured: false,
    new: true,
    cover: "/covers/menopause-diet.jpg",
  },
  {
    id: "today-too-ok",
    title: "Today Too, We Lived Okay",
    titleKo: "오늘두 잘 살았습니두",
    author: "아일랜두",
    authorEn: "Irlandou",
    category: "essay",
    categoryLabel: "Essay",
    categoryLabelKo: "에세이",
    categories: ["essay"],
    categoryLabels: ["Essay"],
    categoryLabelsKo: ["에세이"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 276,
    pubYear: 2025,
    pubMonth: 6,
    age: "",
    coverCopy:
      "Clumsy is fine—everyone is new at this life · Wingless birds Easy and Back · Irlandou’s first picture-essay · 1 million Instagram likes",
    coverCopyKo:
      "부족하고 서툴면 어때, 이번 생은 다들 처음인걸 · 날개 없는 조류 이지와 백 · 아일랜두 첫 그림 에세이 · SNS 좋아요 100만",
    synopsis:
      "A day when nothing goes right. A day you want company and also want to cancel. A day everyone else seems to be moving while you stand still. Adulthood is harder than the slogans about youth.<br /><br />The duo Irlandou draw Easy and Back, two wingless birds on an unknown island, plus Anxiety-and-Pain, a pink creature that will not leave. Two hundred-odd episodes—some never posted—plus extra illustrations. The motto is “with all our hearts, roughly.”<br /><br />Praise for getting through the day is enough. Today too, this was living okay.",
    synopsisKo:
      "하는 일마다 뜻대로 되지 않는 날, 위로받고 싶으면서도 집에 있고 싶은 날, 나만 뒤처지는 것 같은 날. 어른이 된다는 건 말보다 어렵다.<br /><br />작가 듀오 아일랜두는 날개 없는 조류 이지와 백, 그리고 늘 따라다니는 ‘불안과 고통’을 그린다. SNS 미공개분을 포함한 200여 에피소드와 일러스트. 모토는 ‘마음을 다해, 대충’.<br /><br />오늘도 버틴 나 자신을 칭찬해도 된다. 이 정도면 잘 살았다.",
    authorBio:
      "Irlandou is a writer-illustrator duo who like the strange and the funny. Their motto is “with all our hearts, roughly”—doing their best, and also taking the weight off. They draw the dry, warm days of an unknown island, speaking through Easy and Back, two birds without wings, to adults who feel behind at living. Instagram @island.ooo.",
    authorBioKo:
      "이상하고 재미있는 걸 좋아하는 작가 듀오. ‘마음을 다해, 대충’을 모토로, 한편으로는 최선을 다하고 한편으로는 힘을 빼고 산다. 미지의 섬 아일랜두의 무미건조하지만 따뜻한 일상을 만화로 그리며, 날개 없는 조류 이지와 백의 말로 서툰 어른에게 잔잔한 위로를 전한다. 인스타그램 @island.ooo.",
    colors: ["#1a1a1a", "#f5d000"],
    featured: false,
    new: true,
    cover: "/covers/today-too-ok.jpg",
  },
  {
    id: "ppeoni-topping-weaning",
    title: "Ppeoni's Topping Weaning Food",
    titleKo: "뿐이 토핑 이유식",
    author: "정주희",
    authorEn: "Joohee Jeong",
    category: "parenting",
    categoryLabel: "Parenting",
    categoryLabelKo: "자녀교육",
    categories: ["parenting"],
    categoryLabels: ["Parenting"],
    categoryLabelsKo: ["자녀교육"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 640,
    pubYear: 2024,
    pubMonth: 3,
    age: "",
    coverCopy:
      "253 easy, tasty recipes that follow the latest weaning guidance · Five years after the national favorite <i>Teuni Weaning Food</i>",
    coverCopyKo:
      "최신 이유식 지침을 반영한 세상 쉽고 맛있는 레시피 253 · 국민 이유식 『튼이 이유식』 이후 5년 만의 신간",
    synopsis:
      "Ppeoni arrived at 35 weeks, 2.32 kg, and spent her first days in intensive care with an atrial septal defect. Home-cooked topping weaning, baby-led solids, and rice-cooker porridge carried her past 10 kg—and to a clean bill of health without surgery.<br /><br />Joohee Jeong (Heeya), whose first book <i>Teuni Weaning Food</i> became a national guide, rebuilt this volume around current AAP, WHO, and Korean MFDS guidance: start solids around six months, skip the old thin gruel, move texture up faster. Two hundred fifty-three recipes, 38 pages of meal plans, 129 QR cooking clips. Her blog meal-plan posts passed 140,000 comments and 24 million visits.<br /><br />Topping, porridge, baby-led—the form matters less than a child who eats. The goal is three family meals at one table by the first birthday.",
    synopsisKo:
      "뿐이는 35주 1일, 2.32kg의 이른둥이로 태어나 신생아 집중치료실에 입원했고, 심방중격결손 진단까지 받았다. 엄마표 토핑 이유식과 자기주도이유식, 밥솥 죽을 먹으며 10kg이 넘도록 자랐고, 수술 없이 완치 판정을 받았다.<br /><br />국민 이유식 『튼이 이유식』의 정주희(희야)가 미국 소아과학회·WHO·식약처의 최신 지침—생후 6개월 전후 시작, 미음보다 입자감, 농도도 빠르게—을 반영해 다시 썼다. 레시피 253, 식단표 38쪽, QR 영상 129개. 블로그 식단표 댓글 14만, 누적 방문 2,400만.<br /><br />토핑이든 죽이든 자기주도든, 아기가 잘 먹으면 된다. 목표는 돌이 되었을 때 가족이 한자리에 앉아 세 끼를 즐기는 것이다.",
    authorBio:
      "Joohee Jeong (Heeya) is raising Ppeoni and her older sibling Teuni. She first shared Teuni’s weaning and toddler recipes on her blog; that archive became <i>Teuni Weaning Food</i>. For Ppeoni she cooked topping weaning and baby-led solids, studied updated international guidance, and answered parents in 140,000 blog comments. Instagram @j_heeya__ · blog @희야라이프. This volume was reviewed by dietitian Sujin Lee (Gogomom), author of <i>A Dietitian Mom’s Weaning Fundamentals</i>.",
    authorBioKo:
      "정주희(희야)는 뿐이와 첫째 튼이를 키우며 이유식·유아식 레시피를 블로그와 인스타그램에 공유해 왔다. 『튼이 이유식』에 이은 이 책에는 둘째 뿐이에게 만든 토핑 이유식과 최신 지침, 댓글 14만에 담긴 질문을 모았다. 인스타그램 @j_heeya__ · 블로그 @희야라이프. 감수 이수진(고고맘)은 영양사이자 『영양사 맘의 이유식 정석』 저자.",
    colors: ["#2d8a73", "#f4c9c0"],
    featured: false,
    new: true,
    cover: "/covers/ppeoni-topping-weaning.jpg",
  },
  {
    id: "margin-parenting",
    title: "Margin Parenting for Today's Child",
    titleKo: "요즘 아이를 위한 여백 육아",
    author: "최현주",
    authorEn: "Hyunju Choi",
    category: "parenting",
    categoryLabel: "Parenting",
    categoryLabelKo: "자녀교육",
    categories: ["parenting"],
    categoryLabels: ["Parenting"],
    categoryLabelsKo: ["자녀교육"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 296,
    pubYear: 2026,
    pubMonth: 9,
    age: "",
    coverCopy:
      "\"Teacher, what am I doing wrong?\" · A kind warning to parents who want to do it all · From Juju-ssaem, elementary moms’ psychology mentor",
    coverCopyKo:
      "\"선생님, 제가 뭘 잘못하고 있을까요?\" / 초등맘의 심리 멘토 주주쌤의 다 해주고 싶은 부모를 향한 가장 다정한 경고",
    synopsis:
      "After every counseling session, parents ask the same thing: “Teacher, what am I doing wrong?” Most of them are already doing everything they can. What the child needs is not a faster rescue, but enough time to endure and recover.<br /><br />A 22-year elementary teacher, child counselor, and parent educator, Juju-ssaem watches sports days vanish and small playground clashes turn into formal school-violence hearings. Quick empathy and instant problem-solving can block healthy frustration. Friends disagree; adults scold—that is ordinary life.<br /><br />Margin parenting is waiting instead of intervening, and leaving room to look back after a failure rather than catching every fall. That room is where a child learns to live a life of their own.",
    synopsisKo:
      "상담을 마칠 때면 부모들은 늘 같은 것을 묻는다. “선생님, 제가 뭘 잘못하고 있을까요?” 그렇게 묻는 부모들은 대부분 이미 최선을 다하고 있다. 정작 필요한 것은 빠른 문제 해결이 아니라, 아이 스스로 견디고 이겨낼 충분한 시간이다.<br /><br />22년 차 초등교사·아동심리상담사·부모교육상담사 주주쌤은 운동회가 사라지고, 사소한 갈등에도 학폭위가 열리는 교실을 오래 지켜봤다. 아이의 건강한 좌절을 막는 것은 무관심이 아니라, 생각할 겨를도 없이 들어오는 공감과 해결이다.<br /><br />여백 육아는 개입보다 기다림이다. 실패를 막아주기보다 왜 실패했는지 돌아볼 시간을 주는 일. 그 여백이 아이가 스스로 살아갈 힘의 원천이 된다.",
    authorBio:
      "Hyunju Choi (Juju-ssaem) is a 22-year elementary teacher, child psychological counselor, and parent-education counselor. Her books include <i>Why Is My Friend Like That?</i> and <i>When I Know My Child’s Heart Least of All</i>. The year she tried to be a perfect teacher was the year children found her hardest to approach. Twenty-two years in the classroom taught her why: the more adults want to raise a child well, the smaller the space left for the child to try. An Instagram she started to tell classroom stories passed 70,000 followers in a year.",
    authorBioKo:
      "22년 차 초등교사, 아동심리상담사, 부모교육상담사. 저서로 『내 친구는 왜 그럴까』, 『내 아이 마음, 내가 제일 모를 때』가 있다. 완벽한 선생님이 되기 위해 하나도 놓치지 않으려 애쓰던 해에, 아이들이 제일 어려워했다. 스물두 해를 교실에서 보내며 그 까닭을 천천히 알게 되었다. 아이를 잘 키우고 싶은 마음이 클수록, 정작 아이가 스스로 해볼 자리는 좁아진다는 것을. 교실에서 본 아이들 이야기를 전하고 싶어 시작한 인스타그램은 1년 만에 7만 명이 넘는 자리가 되었다.",
    colors: ["#2f6d3f", "#f4d9b8"],
    featured: false,
    new: true,
    cover: "/covers/margin-parenting.jpg",
  },
  {
    id: "five-year-old-sel",
    title: "Social-Emotional Learning at Five",
    titleKo: "다섯 살 사회 정서",
    author: "박밝음",
    authorEn: "Balgeum Park",
    category: "parenting",
    categoryLabel: "Parenting",
    categoryLabelKo: "자녀교육",
    categories: ["parenting"],
    categoryLabels: ["Parenting"],
    categoryLabelsKo: ["자녀교육"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 220,
    pubYear: 2026,
    pubMonth: 9,
    age: "5–7",
    coverCopy:
      "From 2026, social-emotional learning expands across the Korean curriculum · A public kindergarten teacher’s field-tested relationship solutions · 200+ lectures",
    coverCopyKo:
      "2026학년도부터 사회정서학습 확대 · 서울대 출신 공립 유치원 교사의 실전 관계 솔루션 · 누적 200여 회 강의",
    synopsis:
      "At ages 5–7 a child’s world expands from family to peers. Social-emotional learning is how children come to understand and regulate their own feelings, read other people, and choose what to do in a relationship.<br /><br />Drawing on CASEL’s five competencies, public kindergarten teacher Balgeum Park recasts them into four scenes parents actually meet: self-regulation, conflict, social approach, and emotional independence—with checklists and “don’t say this / try this instead” lines. A follow-up to <i>Study Emotions at Five</i>.<br /><br />The starting point is not a grand program. It is the everyday experience of naming a feeling, guessing someone else’s, and working a conflict through.",
    synopsisKo:
      "5~7세가 되면 아이의 세계가 가족에서 또래로 넓어진다. 사회정서학습이란 자기 마음을 이해하고 조절하며, 다른 사람의 마음을 헤아리고, 관계에서 필요한 선택과 행동을 배워가는 과정이다.<br /><br />서울대 출신 공립 유치원 교사 박밝음이 CASEL의 다섯 핵심 역량을, 부모가 실제로 마주치는 네 장면—자기 조절, 갈등 해결, 사회적 접근, 정서적 자립—으로 다시 짰다. 체크리스트와 ‘이렇게 말하지 마세요 / 이렇게 말해보세요’ 키포인트로 바로 찾는다. 『다섯 살 공부 정서』의 후속작.<br /><br />출발점은 거창한 프로그램이 아니다. 감정을 이해하고, 타인의 마음을 헤아리며, 갈등을 건강하게 해결해 본 일상이다.",
    authorBio:
      "Balgeum Park is a child-development researcher and public kindergarten teacher who translates what sits behind a child’s behavior into language parents and teachers can use. She studied child and family studies at Seoul National University, early childhood education at Korea National Open University, and holds an MA from Kyungpook National University, where she also completed doctoral coursework. She has lectured more than 200 times for education offices, libraries, and parenting centers, and runs the Balgum ON Lab. Her books include <i>Study Emotions at Five</i> and, as co-author, <i>Kindergarten: Ask Us Anything</i>.",
    authorBioKo:
      "아이의 행동 너머에 담긴 마음과 발달의 신호를 부모와 교사의 언어로 풀어내는 아동발달 연구자이자 공립유치원 교사. 서울대학교 아동가족학과와 한국방송통신대학교 유아교육과를 졸업하고, 경북대학교에서 아동가족학 석사학위를 받은 뒤 박사과정을 수료했다. 교육청·도서관·육아종합지원센터 등에서 부모와 교사를 대상으로 누적 200여 회 강연했고, 밝음ON 연구소를 운영한다. 저서 『다섯 살 공부 정서』, 공저 『유치원, 무엇이든 물어보세요』.",
    colors: ["#ef3b6c", "#fff4dc"],
    featured: false,
    new: true,
    cover: "/covers/five-year-old-sel.jpg",
  },
  {
    id: "inflammation-on-the-table",
    title: "Inflammation on the Table",
    titleKo: "식탁 위의 염증",
    author: "김슬기",
    authorEn: "Seulgi Kim",
    category: "lifestyle",
    categoryLabel: "Lifestyle/Health",
    categoryLabelKo: "실용/건강",
    categories: ["lifestyle"],
    categoryLabels: ["Lifestyle/Health"],
    categoryLabelsKo: ["실용/건강"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 320,
    pubYear: 2026,
    pubMonth: 9,
    age: "",
    coverCopy:
      "What if the food you trusted is making you sick? · From insulin resistance to chronic disease—the real culprits on the table",
    coverCopyKo:
      "“건강하다고 믿었던 음식이 당신을 병들게 한다면?” / 인슐린 저항성부터 만성 질환까지, 병을 만드는 식탁 위의 진짜 범인들",
    synopsis:
      "Diabetes, hypertension, and high cholesterol are no longer only middle-age problems. A functional nutrition counselor followed by 110,000 readers argues that the shared background of modern chronic illness is inflammation—and that what we eat each day is one of the strongest levers for turning it up or down.<br /><br />Part 1 tracks insulin resistance, oxidized fats, and processed grains. Part 2 reopens the file on saturated fat, meat, refined carbohydrates, and the foods we were told were healthy, and introduces ketogenic eating from the author’s own recovery. Part 3 offers five table rules plus low-carb, keto, carnivore, and GAPS guides anyone can start.<br /><br />If you have been borrowing from tomorrow’s health just to get through today, this is a map for breaking the cycle.",
    synopsisKo:
      "당뇨병, 고혈압, 고지혈증은 더 이상 중장년만의 문제가 아니다. 11만 팔로워가 신뢰하는 영양 전문가이자 미국 FxNA 공인 기능영양 카운슬러인 저자는, 현대 만성 질환의 공통 배경에 염증이 있으며 매일 먹는 음식이 그 불을 키우거나 줄인다고 말한다.<br /><br />1부는 인슐린 저항성·산화 지방·곡물 가공품이 병을 만드는 경로를 짚고, 2부는 포화지방·육류·정제 탄수화물과 ‘건강하다’고 믿어 온 식품을 다시 검토하며 키토제닉의 의미를 소개한다. 3부는 식탁을 바꾸는 다섯 원칙과 당질 제한·키토·카니보어·GAPS 가이드를 담았다.<br /><br />미래의 건강을 미리 당겨 쓰며 하루를 버티고 있다면, 그 악순환을 끊는 길을 안내한다.",
    authorBio:
      "Seulgi Kim (Oozoomom) is a functional nutrition counselor who completed the Functional Nutrition Alliance’s Full Body Systems training. From her twenties she lived with severe alcohol dependence, anorexia, and binge eating; following mainstream medical and nutrition guidelines did not restore her health. Changing what was on the table did. Since 2017 she has taught through podcasts, YouTube, and lectures. Her books include <i>Oozoomom’s Four-Season Immune Toddler Food</i> and <i>Meat Parenting</i>.",
    authorBioKo:
      "미국 Functional Nutrition Alliance의 기능영양 코칭 과정(Full Body Systems)을 이수한 기능영양 카운슬러. 인스타그램에서 11만 팔로워에게 식단과 유아식 정보를 전한다. 20대부터 중증 알코올 중독과 거식·폭식을 비롯한 질병을 안고 살았고, 주류 의학과 표준 영양학을 성실히 따랐으나 건강은 나아지지 않았다. 식탁 위 음식을 바꾸며 비로소 회복하기 시작했다. 2017년부터 팟캐스트·유튜브·강의로 영양 정보를 전한다. 저서 《우주맘의 사계절 튼튼 면역력 유아식》, 《고기 육아》.",
    colors: ["#e31b1b", "#f0c040"],
    featured: false,
    new: true,
    cover: "/covers/inflammation-on-the-table.jpg",
  },
  {
    id: "banggibong",
    title: "The Marvelous Banggibong",
    titleKo: "신기방기 방기봉",
    author: "권귀헌",
    authorEn: "Gwiheon Kwon",
    author2: "남동완",
    author2En: "Dongwan Nam",
    category: "middle",
    categoryLabel: "Middle Grade",
    categoryLabelKo: "아동(10-12)",
    categories: ["middle"],
    categoryLabels: ["Middle Grade"],
    categoryLabelsKo: ["아동(10-12)"],
    series: "",
    seriesKo: "",
    publisher: "서사원주니어",
    publisherEn: "Seosawon Junior",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 140,
    pubYear: 2026,
    pubMonth: 8,
    age: "9–12",
    coverCopy:
      "Banggibong finds a sheet of strange colored paper. Write a skill, fold a plane, fly it—and you’re the best at anything? · A growth story about what real ability means in the age of AI",
    coverCopyKo:
      "수상한 색종이를 손에 넣은 방기봉! 원하는 능력을 적고 종이비행기를 접어 날리면 뭐든 최고가 된다고? / AI 시대를 살아갈 아이들에게 ‘진짜 실력’의 의미를 생각하게 하는 성장 동화",
    synopsis:
      "His hobby is watching bizarre-food mukbang. His dream job is world paper-airplane champion. Elementary-schooler Banggibong, who likes everything except studying, finds a rainbow sheet that grants any skill he writes down and flies as a paper plane.<br /><br />Overnight he scores 100 on every test, wins every contest, and becomes a national YouTube star—the ultimate cheat character. Without effort, though, friendship and ordinary days start to slip. Admiration turns to suspicion. What does the gift actually cost?<br /><br />A funny, twisty middle-grade story that asks children growing up with AI whether the easy path is always the best one, and what it means to do something with your own hands.",
    synopsisKo:
      "취미는 괴식 먹방 보기, 장래 희망은 종이비행기 날리기 세계 챔피언. 공부 빼고 다 좋아하는 초등학생 방기봉은 어느 날, 원하는 능력을 갖게 해 주는 무지개 색종이를 손에 넣는다.<br /><br />시험만 보면 100점, 대회만 나가면 1등, 급기야 전국구 유튜브 스타. ‘우주 최강 사기캐’가 된 기봉이는 세상을 다 가진 것 같았지만, 노력 없이 얻은 능력으로 우정과 일상이 흔들리기 시작한다. 부러움은 의심과 질투로 바뀌고, 생각지 못한 문제가 찾아온다.<br /><br />웃음과 반전 속에서 AI 시대를 살아갈 아이들에게 ‘쉬운 길이 언제나 가장 좋은 걸까’, ‘내 힘으로 해내는 것은 어떤 의미일까’를 묻게 하는 성장 동화.",
    authorBio:
      "Gwiheon Kwon, known as Writing Teacher Kwon, is a writer and a 19-year dad of three. He graduated from the Korea Military Academy in 2003 and earned an MA in education from Seoul National University in 2009. He later chaired the Korean-language department at the Defense Language Institute, teaching Korean and culture to foreign officers. He now runs Glokium, a writing platform for everyone from children to CEOs. His books include <i>The Secret Elementary Writing Class</i>, <i>A Mother’s Writing</i>, and <i>The Power of Questions</i>.",
    authorBioKo:
      "글선생 권귀헌은 작가이자 아이 셋을 키우는 19년 차 육아 대디. 글쓰기가 막막한 초등학생부터 글쓰기가 두려운 어른까지, 만나면 은근히 쓰고 싶어지게 만든다. 2003년 육군사관학교를 졸업하고 2009년 서울대학교에서 교육학 석사를 마쳤다. 국방어학원에서 한국어학과장 및 학처장을 지내며 외국 장교에게 우리말과 문화를 강의했고, 지금은 글쓰기 플랫폼 글로키움 대표로 일한다. 저서 《초등 글쓰기 비밀수업》 《엄마의 글쓰기》 《질문하는 힘》 등.",
    authorBio2:
      "Dongwan Nam studied design at Kyung Hee University, worked at a stationery design firm because she liked children, and now makes picture books for them. Books she wrote and illustrated include <i>Perfect Timing</i> and <i>Hoyt, Chika! Tooth School</i>; books she illustrated include <i>Sweet-and-Sour Ten-Word Science Candy 2</i>. She draws the way she talks with her two children—lively, and for fun.",
    authorBio2Ko:
      "경희대학교에서 디자인을 전공한 뒤 아이들이 좋아서 문구 디자인 회사에 다녔고, 이제는 아이들을 위한 그림책을 만든다. 쓰고 그린 책으로 『완벽한 타이밍』, 『호잇, 치카! 이빨 학교』 등이 있으며, 그린 책으로는 『새콤달콤 열 단어 과학 캔디 2: 생물』 등이 있다. 언제나 두 아이와 함께 즐겁고 신나게 이야기를 나누듯 그림을 그린다.",
    colors: ["#f04898", "#1c3d8f"],
    featured: false,
    new: true,
    cover: "/covers/banggibong.jpg",
    previewImages: [
      "/previews/banggibong/1.jpg",
      "/previews/banggibong/2.jpg",
      "/previews/banggibong/3.jpg",
      "/previews/banggibong/4.jpg",
    ],
  },
  {
    id: "philosophy-beats-anxiety",
    title: "How Philosophy Beats Anxiety",
    titleKo: "철학은 어떻게 불안을 이기는가",
    author: "박은미",
    authorEn: "Eunmi Park",
    category: "humanities",
    categoryLabel: "Humanities/Social Science",
    categoryLabelKo: "인문/사회",
    categories: ["humanities"],
    categoryLabels: ["Humanities/Social Science"],
    categoryLabelsKo: ["인문/사회"],
    publisher: "서사원",
    publisherEn: "Seosawon",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 272,
    pubYear: 2026,
    pubMonth: 8,
    age: "",
    coverCopy:
      "Epicurus, the first philosopher to put life’s wisdom first—on the pleasure of a mind willing to enjoy being alive",
    coverCopyKo:
      "인생의 지혜에 주목한 최초의 철학자 에피쿠로스, 살아 있음을 기꺼이 누리는 정신의 즐거움을 말하다",
    synopsis:
      "Miscast as a selfish hedonist, Epicurus spent his life offering people drowning in baseless fear a way to exist, to live, and to be with others. Philosophy communicator Eunmi Park, writing after thirty years in the field, chooses some twenty-five sayings from more than 120 surviving lines.<br /><br />Four movements: sorting false desires from real ones; discovering plenty in a simpler life; refusing to be ruled by the fear of what cannot be known; and spending an unrepeatable today with other people. Each piece ends with a question for the reader.<br /><br />The point is not to consume a sage’s wisdom as knowledge. It is to become someone who thinks.",
    synopsisKo:
      "이기적 쾌락주의자로 오해받아 온 에피쿠로스는, 근거 없는 공포와 불안에 휩싸인 사람들에게 존재하는 방식·살아가는 방식·관계 맺는 방식의 모범을 제시한 철학자였다. 30년 경력의 철학커뮤니케이터 박은미가 120개가 넘는 구절 가운데 오늘날 필요한 25여 잠언을 엄선했다.<br /><br />4장 구성. 가짜 욕망과 진짜 욕망을 구별하고, 소박하게 살 때 풍요를 누리며, 알 수 없음의 공포에 압도되지 않고, 다시 오지 않을 오늘을 타인과 함께 누린다. 각 편 끝의 자기 점검 질문이 독자를 사유하는 사람으로 이끈다.<br /><br />철학자의 지혜를 지식으로 소비하는 데 그치지 않고, 스스로 생각하는 사람이 되도록 쓰였다.",
    authorBio:
      "Eunmi Park is a philosophy PhD and philosophy communicator. She studied at Ewha Womans University, including her doctorate, then taught at Konkuk University and Sejong University. She now writes and lectures for general readers, including the Naver Premium channel “Philosophy for Everyday Life.” Her books include <i>You Are Happy When You Live as Your Real Self</i>, <i>Is Life Unpleasant?: Schopenhauer</i>, <i>Very Everyday Philosophy</i>, and <i>What It Means to Live as Yourself</i>.",
    authorBioKo:
      "철학박사·철학커뮤니케이터. 이화여대에서 학사와 철학 박사학위를 받았다. 건국대학교 강의교수와 세종대학교 초빙교수를 거쳐 지금은 일반인을 위한 철학 저서와 강의에 전념한다. 네이버 프리미엄 콘텐츠 ‘일상을 위한 철학’ 채널을 운영한다. 저서 『진짜 나로 살 때 행복하다』, 『삶이 불쾌한가: 쇼펜하우어 의지와 표상으로서의 세계』, 『아주 일상적인 철학』, 『나답게 산다는 것』 등.",
    colors: ["#a32e22", "#2a5f5c"],
    featured: false,
    new: true,
    cover: "/covers/philosophy-beats-anxiety.jpg",
  },
  {
    id: "cat-math-kids",
    title: "Cat Math Kids: A–E Set",
    titleKo: "고양이 수학 키즈 A~E 세트",
    author: "강미선",
    authorEn: "Miseon Kang",
    category: "baby",
    categoryLabel: "Baby/Toddler",
    categoryLabelKo: "아동(0-6)",
    categories: ["baby", "early"],
    categoryLabels: ["Baby/Toddler", "Early Grade"],
    categoryLabelsKo: ["아동(0-6)", "아동(7-9)"],
    series: "",
    seriesKo: "",
    publisher: "서사원주니어",
    publisherEn: "Seosawon Junior",
    country: "Korea",
    format: [],
    rightsNote: "",
    rightsNoteKo: "",
    territories: "",
    territoriesKo: "",
    pages: 180,
    pubYear: 2026,
    pubMonth: 9,
    age: "5–7",
    coverCopy:
      "First math at ages 5–7 with kittens · Picture-book activity set in five volumes · By math-education PhD Miseon Kang",
    coverCopyKo:
      "5~7세 첫 수학은 아기 고양이와 · 그림책 같은 활동북 전5권 · 데카르트 수학책방 강미선 박사",
    synopsis:
      "A five-volume preschool math set filled with kittens—from birth to a first-birthday party. Counting, shapes, addition and subtraction, clocks and calendars hide in the everyday work of caring for cats, learned the way a picture book is read.<br /><br />This is math you color, path-find, and compare—not math you only read. Miseon Kang, a PhD in mathematics education who runs Korea’s first specialist math bookstore, Descartes, wrote it as a bridge from kindergarten to early elementary.<br /><br />The point is not finishing every problem. It is that a child’s first impression of math can be warm.",
    synopsisKo:
      "전5권으로 구성된 『고양이 수학 키즈』는 귀여운 아기 고양이가 가득한 유아 수학 활동북이다. 아기 고양이의 탄생에서 한 살 생일 파티까지, 돌보는 일상에 숨은 수 세기·도형·덧셈·뺄셈·시계와 달력을 그림책처럼 익힌다.<br /><br />글로만 배우는 수학이 아니라 색칠하고, 길을 찾고, 길이를 비교하며 체험하는 수학. 국내 최초 수학 전문 서점 데카르트 수학책방을 운영하는 강미선 수학교육학 박사가 누리과정부터 초등 저학년까지 잇는 유초이음으로 썼다.<br /><br />무엇보다 중요한 건 문제를 다 푸는 것보다 수학에 재미를 느끼는 것. 사랑스러운 아기 고양이와 함께라면 수학의 첫인상이 따뜻해진다.",
    authorBio:
      "Miseon Kang holds a BA in mathematics education from Sungkyunkwan University and an MA and PhD from Ewha Womans University. Years as a high-school math teacher and exam lecturer convinced her that later success depends on grasping concepts and principles early. She researches how to teach those concepts and how to make children actually like math, and she publishes and lectures widely on both. She hosted the Naver Audio Clip “Miseon Kang’s Math Counseling Office,” now teaches mathematics education at university, and runs Descartes, Korea’s first specialist math bookstore. Her twenty-odd books include <i>Math Is Rice</i>, the Fraction Method series, <i>Hong Jeong-ha, Joseon’s God of Mathematics</i>, and <i>Kang-ssaem’s Math Counseling Office</i>.",
    authorBioKo:
      "성균관대학교 수학교육과에서 학사 학위를, 이화여자대학교 수학교육학과에서 석사와 박사 학위를 받았다. 고등학교 수학 교사와 대입 단과 수학 강사로 가르치며, 기초 개념과 원리를 제대로 익히는 일이 얼마나 중요한지 절감했다. 개념을 잘 가르치는 법과 아이들에게 수학의 흥미를 불어넣는 법을 연구하고, 그 결과를 책과 강의로 알리며 수학교육 대중화에 힘쓰고 있다. 네이버 오디오클립 「강미선의 수학 상담소」를 진행했고, 지금은 대학교에서 수학교육학을 강의한다. 국내 최초 수학 전문 서점 데카르트 수학책방 운영자이기도 하다. 저서로 「분수 비법 시리즈」, 『수학은 밥이다』, 『조선 수학의 신, 홍정하』, 『강쌤의 수학상담소』 등 20여 권이 있다.",
    colors: ["#3dccc4", "#ff7a3c"],
    featured: false,
    new: true,
    cover: "/covers/cat-math-kids.jpg",
    previewImages: [
      "/previews/cat-math-kids/1.jpg",
      "/previews/cat-math-kids/2.jpg",
      "/previews/cat-math-kids/3.jpg",
      "/previews/cat-math-kids/4.jpg",
    ],
  },
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
  const pendingById = new Map(
    PENDING_EXPORT_TITLES.map((t) => [t.id, t] as const)
  );
  const sheetIds = new Set(titles.map((t) => t.id));
  const merged = titles.map((t) => {
    const p = pendingById.get(t.id);
    if (!p) return t;
    const next = { ...t };
    if ("series" in p || "seriesKo" in p) {
      next.series = p.series || "";
      next.seriesKo = p.seriesKo || "";
    }
    if ("bookSize" in p) {
      next.bookSize = p.bookSize || "";
    }
    if (p.id === "emotion-copying") {
      next.coverCopy = p.coverCopy;
      next.coverCopyKo = p.coverCopyKo;
    }
    return next;
  });
  const extra = PENDING_EXPORT_TITLES.filter((t) => !sheetIds.has(t.id));
  return extra.length ? [...extra, ...merged] : merged;
}
