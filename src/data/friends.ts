export type FriendLink = {
  name: string;
  url: string;
  description: string;
  lang?: string;
};

export const friends: FriendLink[] = [
  {
    name: 'Files.js.gripe',
    url: 'https://files.js.gripe/',
    description: 'Public file service for JS.Gripe.'
  },
  {
    name: 'SSL Signer',
    url: 'http://ssl-signer.js.gripe/',
    description: 'Certificate signing and SSL utility service for JS.Gripe.'
  },
  {
    name: 'Acount.js.gripe',
    url: 'https://acount.js.gripe/',
    description: 'Account service for JS.Gripe.'
  },
  {
    name: 'Search.js.gripe',
    url: 'https://search.js.gripe/',
    description: 'Search service for JS.Gripe.'
  }
];
