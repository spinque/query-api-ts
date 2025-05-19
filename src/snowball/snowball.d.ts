export interface Stemmer {
  stem(term: string): string;
}

export function newStemmer(locale: StemmerAlgorithm): Stemmer;

export type StemmerAlgorithm =
  | 'arabic'
  | 'armenian'
  | 'basque'
  | 'catalan'
  | 'czech'
  | 'danish'
  | 'dutch'
  | 'english'
  | 'finnish'
  | 'french'
  | 'german'
  | 'hungarian'
  | 'italian'
  | 'irish'
  | 'norwegian'
  | 'porter'
  | 'portuguese'
  | 'romanian'
  | 'russian'
  | 'spanish'
  | 'slovene'
  | 'swedish'
  | 'tamil'
  | 'turkish';
