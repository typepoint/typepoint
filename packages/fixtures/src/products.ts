export interface Product {
  id: string;
  name: string;
  url: string;
}

export function getProducts(): Product[] {
  return [{
    id: '1',
    name: 'Plumbus',
    url: 'http://rickandmorty.wikia.com/wiki/Plumbus',
  }, {
    id: '2',
    name: 'Microverse Battery',
    url: 'http://rickandmorty.wikia.com/wiki/Microverse_Battery',
  }, {
    id: '3',
    name: 'Fleeb',
    url: 'http://rickandmorty.wikia.com/wiki/Fleeb',
  }, {
    id: '4',
    name: 'Gwendolyn',
    url: 'http://rickandmorty.wikia.com/wiki/Gwendolyn',
  }];
}
