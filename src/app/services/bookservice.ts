import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private baseUrl = 'https://openlibrary.org';

  constructor(private http: HttpClient) {}

  async getBooksByGenre(genre: string) {
    // A Open Library usa minúsculas e snake_case para subjects
    const subject = genre.toLowerCase().replace(' ', '_');
    
    // Buscamos 10 livros por gênero para não sobrecarregar
    const url = `${this.baseUrl}/subjects/${subject}.json?limit=10`;
    
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      
      // Mapeamos para o formato que seu Feed espera
      return response.works.map((work: any) => ({
        titulo: work.title,
        // A Open Library usa IDs para capas. O 'M' é para tamanho médio.
        capa: work.cover_id 
          ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` 
          : 'assets/imgs/default-cover.jpg', 
        descricao: work.authors?.[0]?.name || 'Autor desconhecido'
      }));
    } catch (error) {
      console.error(`Erro ao buscar livros de ${genre}:`, error);
      return [];
    }
  }
}