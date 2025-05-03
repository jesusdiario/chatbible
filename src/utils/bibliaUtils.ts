
// Funções utilitárias para manipulação de dados da Bíblia

// Função auxiliar para obter o nome do livro pelo seu código
export function getBookNameByAbbrev(abbrev: string): string {
  const booksMap: Record<string, string> = {
    'gn': 'Gênesis',
    'ex': 'Êxodo',
    'lv': 'Levítico',
    'nm': 'Números',
    'dt': 'Deuteronômio',
    'js': 'Josué',
    'jz': 'Juízes',
    'rt': 'Rute',
    '1sm': '1 Samuel',
    '2sm': '2 Samuel',
    '1rs': '1 Reis',
    '2rs': '2 Reis',
    '1cr': '1 Crônicas',
    '2cr': '2 Crônicas',
    'ed': 'Esdras',
    'ne': 'Neemias',
    'et': 'Ester',
    'jó': 'Jó',
    'sl': 'Salmos',
    'pv': 'Provérbios',
    'ec': 'Eclesiastes',
    'ct': 'Cânticos',
    'is': 'Isaías',
    'jr': 'Jeremias',
    'lm': 'Lamentações',
    'ez': 'Ezequiel',
    'dn': 'Daniel',
    'os': 'Oséias',
    'jl': 'Joel',
    'am': 'Amós',
    'ob': 'Obadias',
    'jn': 'Jonas',
    'mq': 'Miquéias',
    'na': 'Naum',
    'hc': 'Habacuque',
    'sf': 'Sofonias',
    'ag': 'Ageu',
    'zc': 'Zacarias',
    'ml': 'Malaquias',
    'mt': 'Mateus',
    'mc': 'Marcos',
    'lc': 'Lucas',
    'jo': 'João',
    'at': 'Atos',
    'rm': 'Romanos',
    '1co': '1 Coríntios',
    '2co': '2 Coríntios',
    'gl': 'Gálatas',
    'ef': 'Efésios',
    'fp': 'Filipenses',
    'cl': 'Colossenses',
    '1ts': '1 Tessalonicenses',
    '2ts': '2 Tessalonicenses',
    '1tm': '1 Timóteo',
    '2tm': '2 Timóteo',
    'tt': 'Tito',
    'fm': 'Filemom',
    'hb': 'Hebreus',
    'tg': 'Tiago',
    '1pe': '1 Pedro',
    '2pe': '2 Pedro',
    '1jo': '1 João',
    '2jo': '2 João',
    '3jo': '3 João',
    'jd': 'Judas',
    'ap': 'Apocalipse',
  };
  
  return booksMap[abbrev.toLowerCase()] || abbrev;
}

// Função para obter informações de livro a partir de um book_id
export function parseBookInfo(bookId: string): { abbrev: string; name: string } {
  // Remover lógica de testamento
  const abbrev = String(bookId);
  const name = getBookNameByAbbrev(abbrev || '');
  
  return {
    abbrev: abbrev || '',
    name
  };
}

// Função para extrair o nome do livro do book_id
export function getBookNameFromId(bookId: string): string {
  return getBookNameByAbbrev(bookId);
}

// Função para converter string para número ou undefined
export function toNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(num) ? undefined : num;
}
