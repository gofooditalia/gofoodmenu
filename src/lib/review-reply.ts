/**
 * Risposte alle recensioni Google scritte con l'AI.
 * Istruzioni per il modello condivise tra l'assistente manuale della dashboard e,
 * quando avremo l'accesso alle API di Google Business Profile, le risposte automatiche.
 */

export type ReviewTone = 'amichevole' | 'formale';

export interface ReviewReplySettings {
  tone: ReviewTone;
  signature: string;
  instructions: string;
}

export interface ReviewInput {
  text: string;
  rating: number; // 1-5
  reviewerName?: string;
}

export const DEFAULT_REVIEW_SETTINGS: ReviewReplySettings = {
  tone: 'amichevole',
  signature: '',
  instructions: '',
};

export const REVIEW_REPLY_VARIANTS = 3;
export const MAX_REVIEW_LENGTH = 4000;
export const MAX_INSTRUCTIONS_LENGTH = 1000;

const TONE_GUIDE: Record<ReviewTone, string> = {
  amichevole: 'caldo e amichevole, dai del tu al cliente (o il registro naturale della sua lingua), come un titolare che conosce i suoi ospiti',
  formale: 'cortese e professionale, dai del lei al cliente (o il registro formale della sua lingua)',
};

export function buildReviewReplyPrompt(
  restaurantName: string,
  settings: ReviewReplySettings,
  review: ReviewInput
): string {
  const signature = settings.signature.trim() || restaurantName;
  const ownerRules = settings.instructions.trim();

  return `
Sei il titolare del ristorante "${restaurantName}" e rispondi pubblicamente a una recensione su Google.
Scrivi ${REVIEW_REPLY_VARIANTS} risposte alternative, diverse tra loro per formulazione.

${ownerRules ? `ISTRUZIONI DEL TITOLARE (hanno la precedenza su tutto il resto, salvo i divieti assoluti):
${ownerRules}
` : ''}
REGOLE
- Rispondi nella stessa lingua della recensione.
- Tono: ${TONE_GUIDE[settings.tone]}.
- Personalizza: riprendi uno o due dettagli concreti scritti dal cliente. Se la recensione non ha testo, ringrazia per il voto in modo breve.
- Adatta la risposta al voto: con 4-5 stelle ringrazia; con 3 stelle ringrazia e mostra che terrete conto dei punti critici; con 1-2 stelle scusati con sincerità senza polemiche né giustificazioni e invita il cliente a contattare il locale.
- Lunghezza: 2-4 frasi, niente elenchi, niente hashtag, al massimo un'emoji e solo con tono amichevole e voto alto.
- Chiudi con la firma "${signature}" su una riga a parte, separata dal testo da un a capo.
- Se c'è il nome del cliente, puoi usare il nome di battesimo.
- Se il cliente scrive al plurale (es. "siamo stati", "eravamo in gruppo"), rivolgiti al gruppo (voi, o il plurale della sua lingua). Usa lo stesso pronome in tutta la risposta: non mescolare mai tu, voi e lei.

DIVIETI ASSOLUTI
- Non inventare fatti che non sono nella recensione (piatti, persone, date, eventi).
- Non promettere sconti, omaggi, rimborsi o compensi di alcun tipo, salvo che le istruzioni del titolare lo prevedano esplicitamente.
- Non chiedere di modificare o rimuovere la recensione.
- Non impegnarti a fare cambiamenti concreti nel locale (niente "valuteremo", "cambieremo", "provvederemo", "sistemeremo"): sui suggerimenti e le critiche ringrazia e di' che ne terrete conto, senza promettere azioni.
- Non ammettere né smentire accuse specifiche (es. prodotti congelati, igiene, prezzi sbagliati): riconosci che l'esperienza non è stata all'altezza e invita a parlarne direttamente con il locale.
- Non citare dati personali oltre al nome del cliente.

RECENSIONE
Voto: ${review.rating} stelle su 5
Cliente: ${review.reviewerName?.trim() || '(nome non indicato)'}
Testo: ${review.text.trim() || '(nessun testo, solo il voto)'}

Rispondi SOLO con un oggetto JSON valido nel formato:
{"replies": ["prima risposta", "seconda risposta", "terza risposta"]}
`.trim();
}
