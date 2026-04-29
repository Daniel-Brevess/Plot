/*
  Exporta a classe da página/componente.
  Essa classe controla os dados que serão usados no HTML.
*/
export class SuaPaginaPage {

    /*
      books:
      Array (lista) de objetos.
      Cada objeto representa um livro da tela.
  
      Esse array será percorrido no HTML usando *ngFor.
    */
    books = [
  
      /*
        Primeiro objeto da lista.
        title = título do livro
        image = caminho da imagem dentro da pasta assets
        description = texto descritivo do livro
      */
      {
        title: 'O Poder do Hábito',
        image: 'assets/img/livro1.jpg',
        description: 'Durante os últimos dois anos, uma jovem transformou quase todos os aspectos de sua vida.'
      },
  
      /*
        Segundo livro
      */
      {
        title: 'Hábitos Atômicos',
        image: 'assets/img/livro2.jpg',
        description: 'Não importa quais sejam seus objetivos, Hábitos Atômicos oferece um método eficaz para você se aprimorar.'
      },
  
      /*
        Terceiro livro
      */
      {
        title: 'As coisas que você só vê quando desacelera',
        image: 'assets/img/livro3.jpg',
        description: 'Ilustrado com extrema delicadeza, ele nos ajuda a entender nossos relacionamentos, nosso trabalho, nossas aspirações.'
      },
  
      /*
        Quarto livro
      */
      {
        title: 'A psicologia financeira',
        image: 'assets/img/livro4.jpg',
        description: 'O sucesso financeiro tem menos a ver com a sua inteligência e muito mais a ver com o seu comportamento.'
      }
    ];
  }