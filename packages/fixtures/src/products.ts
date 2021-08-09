export interface Product {
  id: string;
  name: string;
  url: string;
  stock: number;
}

export function getProducts(): Product[] {
  return [{
    id: '1',
    name: 'Plumbus',
    url: 'http://rickandmorty.wikia.com/wiki/Plumbus',
    stock: 25,
  }, {
    id: '2',
    name: 'Microverse Battery',
    url: 'http://rickandmorty.wikia.com/wiki/Microverse_Battery',
    stock: 10,
  }, {
    id: '3',
    name: 'Fleeb',
    url: 'http://rickandmorty.wikia.com/wiki/Fleeb',
    stock: 50,
  }, {
    id: '4',
    name: 'Gwendolyn',
    url: 'http://rickandmorty.wikia.com/wiki/Gwendolyn',
    stock: 0,
  }];
}
