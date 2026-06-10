import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface BookListItem {
  id: string;
  titulo: string;
  capa: string;
  descricao: string;
  autores: string[];
  primeiraPublicacao?: string;
  sinopse: string;
  temCapa: boolean;
  temAutor: boolean;
  temSinopse: boolean;
  avaliacao: BookRating;
}

export interface BookDetail {
  id: string;
  titulo: string;
  capa: string;
  descricao: string;
  autores: string[];
  primeiraPublicacao: string;
  assuntos: string[];
  personagens: string[];
  lugares: string[];
  epocas: string[];
  links: Array<{ titulo: string; url: string }>;
  trechos: string[];
  ultimaAtualizacao: string;
  avaliacao: BookRating;
}

export interface BookRating {
  media: number | null;
  total: number;
  distribuicao: Record<1 | 2 | 3 | 4 | 5, number>;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private baseUrl = 'https://openlibrary.org';
  private subjectAliases: Record<string, string> = {
    'aventura': 'adventure',
    'autoajuda': 'self_help',
    'biografia': 'biography',
    'classicos': 'classic_literature',
    'drama': 'drama',
    'fantasia': 'fantasy',
    'ficcao cientifica': 'science_fiction',
    'ficcao_cientifica': 'science_fiction',
    'historia': 'history',
    'poesia': 'poetry',
    'romance': 'romance',
    'suspense': 'thriller',
    'terror': 'horror',
    'clássicos': 'classic_literature',
    'clÃ¡ssicos': 'classic_literature',
    'clÃƒÂ¡ssicos': 'classic_literature'
  };

  constructor(private http: HttpClient) {}

  async getBooksByGenre(genre: string, limit = 10, offset = 0): Promise<BookListItem[]> {
    const normalizedGenre = genre.toLowerCase();
    const subject = this.subjectAliases[normalizedGenre] || normalizedGenre.replace(/ /g, '_');
    const url = `${this.baseUrl}/subjects/${subject}.json?limit=${limit}&offset=${offset}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));
      const works = response.works || [];
      return Promise.all(works.map((work: any) => this.mapSubjectWork(work)));
    } catch (error) {
      console.error(`Erro ao buscar livros de ${genre}:`, error);
      return [];
    }
  }

  async searchBooks(query: string, limit = 10, offset = 0): Promise<BookListItem[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const params = new URLSearchParams({
      q: trimmedQuery,
      limit: String(limit),
      offset: String(offset),
      fields: 'key,title,author_name,cover_i,first_publish_year'
    });

    try {
      const response: any = await firstValueFrom(this.http.get(`${this.baseUrl}/search.json?${params}`));
      const docs = response.docs || [];
      return Promise.all(docs.map((doc: any) => this.mapSearchDoc(doc)));
    } catch (error) {
      console.error(`Erro ao buscar livros por texto "${query}":`, error);
      return [];
    }
  }

  async getBookDetails(workId: string): Promise<BookDetail> {
    const id = this.getWorkId(workId);
    const work: any = await firstValueFrom(this.http.get(`${this.baseUrl}/works/${id}.json`));
    const [autores, avaliacao] = await Promise.all([
      this.getAuthors(work.authors || []),
      this.getRating(id)
    ]);

    return {
      id,
      titulo: work.title || 'Titulo desconhecido',
      capa: this.getCover(work.covers?.[0], 'L'),
      descricao: this.getDescription(work.description, 'A Open Library nao forneceu uma descricao para este livro.'),
      autores,
      primeiraPublicacao: work.first_publish_date || 'Data nao informada',
      assuntos: work.subjects || [],
      personagens: work.subject_people || [],
      lugares: work.subject_places || [],
      epocas: work.subject_times || [],
      links: (work.links || [])
        .map((link: any) => ({
          titulo: link.title || link.url,
          url: link.url
        }))
        .filter((link: { url: string }) => !!link.url),
      trechos: (work.excerpts || [])
        .map((excerpt: any) => excerpt.excerpt)
        .filter((excerpt: string) => !!excerpt),
      ultimaAtualizacao: work.last_modified?.value || work.created?.value || 'Nao informado',
      avaliacao
    };
  }

  private async mapSubjectWork(work: any): Promise<BookListItem> {
    const id = this.getWorkId(work.key);
    const autores = this.getListAuthors(work.authors?.map((author: any) => author.name));
    const [resumo, avaliacao] = await Promise.all([
      this.getWorkSummary(id),
      this.getRating(id)
    ]);

    return {
      id,
      titulo: work.title || 'Titulo desconhecido',
      capa: this.getCover(work.cover_id, 'M'),
      descricao: resumo.sinopse,
      autores,
      primeiraPublicacao: work.first_publish_year ? String(work.first_publish_year) : undefined,
      sinopse: resumo.sinopse,
      temCapa: !!work.cover_id,
      temAutor: autores[0] !== 'Autor desconhecido',
      temSinopse: resumo.temSinopse,
      avaliacao
    };
  }

  private async mapSearchDoc(doc: any): Promise<BookListItem> {
    const id = this.getWorkId(doc.key);
    const autores = this.getListAuthors(doc.author_name);
    const [resumo, avaliacao] = await Promise.all([
      this.getWorkSummary(id),
      this.getRating(id)
    ]);

    return {
      id,
      titulo: doc.title || 'Titulo desconhecido',
      capa: this.getCover(doc.cover_i, 'M'),
      descricao: resumo.sinopse,
      autores,
      primeiraPublicacao: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
      sinopse: resumo.sinopse,
      temCapa: !!doc.cover_i,
      temAutor: autores[0] !== 'Autor desconhecido',
      temSinopse: resumo.temSinopse,
      avaliacao
    };
  }

  private async getRating(workId: string): Promise<BookRating> {
    try {
      const response: any = await firstValueFrom(this.http.get(`${this.baseUrl}/works/${workId}/ratings.json`));
      const average = Number(response.summary?.average);
      const count = Number(response.summary?.count || 0);
      const counts = response.counts || {};

      return {
        media: count > 0 && Number.isFinite(average) ? average : null,
        total: count,
        distribuicao: {
          1: Number(counts[1] || 0),
          2: Number(counts[2] || 0),
          3: Number(counts[3] || 0),
          4: Number(counts[4] || 0),
          5: Number(counts[5] || 0)
        }
      };
    } catch (error) {
      console.error(`Erro ao buscar avaliacao do livro ${workId}:`, error);
      return {
        media: null,
        total: 0,
        distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  }

  private async getWorkSummary(workId: string): Promise<{ sinopse: string; temSinopse: boolean }> {
    try {
      const work: any = await firstValueFrom(this.http.get(`${this.baseUrl}/works/${workId}.json`));
      const sinopse = this.getDescription(work.description, '');

      if (sinopse) {
        return {
          sinopse: this.limitText(sinopse, 280),
          temSinopse: true
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar sinopse do livro ${workId}:`, error);
    }

    return {
      sinopse: 'Sinopse indisponivel na Open Library.',
      temSinopse: false
    };
  }

  private async getAuthors(authors: any[]): Promise<string[]> {
    const authorKeys = authors
      .map(authorRef => authorRef.author?.key)
      .filter((key: string | undefined) => !!key);

    if (!authorKeys.length) {
      return ['Autor desconhecido'];
    }

    const requests = authorKeys.map(async (key: string) => {
      try {
        const author: any = await firstValueFrom(this.http.get(`${this.baseUrl}${key}.json`));
        return author.name || author.personal_name;
      } catch (error) {
        console.error(`Erro ao buscar autor ${key}:`, error);
        return null;
      }
    });

    const names = (await Promise.all(requests)).filter((name: string | null) => !!name);
    return names.length ? names : ['Autor desconhecido'];
  }

  private getListAuthors(authors: string[] | undefined): string[] {
    return authors?.length ? authors : ['Autor desconhecido'];
  }

  private getDescription(description: string | { value?: string } | undefined, fallback: string): string {
    if (!description) {
      return fallback;
    }

    return typeof description === 'string' ? description : description.value || fallback;
  }

  private getCover(coverId: number | undefined, size: 'M' | 'L'): string {
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
      : 'assets/default-cover.svg';
  }

  private getWorkId(key: string): string {
    return key.replace('/works/', '');
  }

  private limitText(text: string, maxLength: number): string {
    const normalized = text.replace(/\s+/g, ' ').trim();
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}...` : normalized;
  }
}
