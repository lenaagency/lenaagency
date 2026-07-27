export type Lang = "ko" | "en";

export type ExportTitle = {
  id: string;
  title: string;
  titleKo: string;
  author: string;
  authorEn?: string;
  /** Primary category id (first of multi-select) */
  category: string;
  categoryLabel: string;
  categoryLabelKo: string;
  /** All category ids (sheet multi-select: comma / | separated) */
  categories?: string[];
  categoryLabels?: string[];
  categoryLabelsKo?: string[];
  publisher: string;
  publisherEn?: string;
  country: string;
  format: string[];
  rightsNote: string;
  rightsNoteKo: string;
  territories: string;
  territoriesKo: string;
  /** Languages already licensed (detail page "Rights Sold") */
  rightsSold?: string;
  rightsSoldKo?: string;
  pages: number;
  pubYear: number;
  age: string;
  /** Series name (English) — sheet: series / seriesEn / 영문시리즈명 */
  series?: string;
  /** Series name (Korean) — sheet: seriesKo / 시리즈명 */
  seriesKo?: string;
  synopsis: string;
  synopsisKo: string;
  /** Cover / belly-band marketing lines */
  coverCopy?: string;
  coverCopyKo?: string;
  authorBio?: string;
  authorBioKo?: string;
  colors: string[];
  featured?: boolean;
  new?: boolean;
  cover?: string;
  /**
   * Interior / sample page images (typically 3–4).
   * From sheet columns preview1–preview4 or combined `preview`.
   */
  previewImages?: string[];
};

export type ImportHighlight = {
  id: string;
  title: string;
  titleKo: string;
  author: string;
  rightsHolder: string;
  koreanPublisher: string;
  country: string;
  pubYear: number | null;
  cumSold: number;
  cover?: string;
  colors: string[];
};
