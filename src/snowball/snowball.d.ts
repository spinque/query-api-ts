export interface Stemmer {
  stem(term: string): string;
}

export function newStemmer(locale: string): Stemmer;
