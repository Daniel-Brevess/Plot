export const PLOT_GENRES = [
  'Romance',
  'Ficcao Cientifica',
  'Fantasia',
  'Terror',
  'Biografia',
  'Historia',
  'Suspense',
  'Autoajuda',
  'Poesia',
  'Drama',
  'Aventura',
  'Classicos'
];

const GENRE_ALIASES: Record<string, string> = {
  'ficcao cientifica': 'Ficcao Cientifica',
  'ficã§ã£o cientã­fica': 'Ficcao Cientifica',
  'ficãƒâ§ãƒâ£o cientãƒâ­fica': 'Ficcao Cientifica',
  'historia': 'Historia',
  'histã³ria': 'Historia',
  'histãƒâ³ria': 'Historia',
  'classicos': 'Classicos',
  'clã¡ssicos': 'Classicos',
  'clãƒâ¡ssicos': 'Classicos'
};

export function normalizeGenre(genero: string): string {
  const key = genero
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

  return GENRE_ALIASES[key] || PLOT_GENRES.find(item => item.toLowerCase() === key) || genero;
}

export function normalizeGenres(generos: string[]): string[] {
  const normalized = generos
    .map(genero => normalizeGenre(genero))
    .filter(genero => PLOT_GENRES.includes(genero));

  return Array.from(new Set(normalized)).slice(0, 3);
}
