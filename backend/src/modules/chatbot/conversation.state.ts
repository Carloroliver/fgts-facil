import { ConversationStage, LeadStatus } from '@prisma/client';
import { isValidCpf, cleanCpf } from '../../utils/cpf';

interface StageTransition {
  nextStage: ConversationStage;
  status?: LeadStatus;
  extractData?: (message: string) => Record<string, any> | null;
  validate?: (message: string) => string | null; // retorna erro ou null se valido
}

function isPositive(msg: string): boolean {
  const lower = msg.toLowerCase().trim();
  return /^(sim|s|yes|claro|com certeza|isso|sou|tenho|ja|aham|uhum|positivo|exato|trabalho|sou clt)/i.test(lower);
}

function isNegative(msg: string): boolean {
  const lower = msg.toLowerCase().trim();
  return /^(nao|n|no|nope|ainda nao|nunca|nenhum|negativo)/i.test(lower);
}

function extractCurrency(msg: string): number | null {
  const cleaned = msg.replace(/[rR$\s.]/g, '').replace(',', '.');
  const match = cleaned.match(/(\d+\.?\d*)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return value > 0 ? value : null;
}

function extractDate(msg: string): Date | null {
  const match = msg.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!match) return null;
  const day = parseInt(match[1]);
  const month = parseInt(match[2]) - 1;
  let year = parseInt(match[3]);
  if (year < 100) year += 1900;
  if (year < 1940 || year > 2010) return null;
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

export const stageTransitions: Record<string, (message: string) => StageTransition> = {
  [ConversationStage.WELCOME]: (msg) => ({
    nextStage: ConversationStage.QUALIFICATION_CLT,
    status: LeadStatus.QUALIFYING,
  }),

  [ConversationStage.QUALIFICATION_CLT]: (msg) => {
    if (isPositive(msg)) {
      return {
        nextStage: ConversationStage.QUALIFICATION_SAQUE_ANIV,
        extractData: () => ({ isClt: true }),
      };
    }
    return {
      nextStage: ConversationStage.QUALIFICATION_CLT,
      extractData: () => ({ isClt: false }),
    };
  },

  [ConversationStage.QUALIFICATION_SAQUE_ANIV]: (msg) => {
    if (isPositive(msg)) {
      return {
        nextStage: ConversationStage.FGTS_BALANCE,
        extractData: () => ({ hasSaqueAniv: true }),
      };
    }
    return {
      nextStage: ConversationStage.QUALIFICATION_SAQUE_ANIV,
      extractData: () => ({ hasSaqueAniv: false }),
    };
  },

  [ConversationStage.FGTS_BALANCE]: (msg) => {
    const value = extractCurrency(msg);
    if (value && value >= 500) {
      return {
        nextStage: ConversationStage.SIMULATION,
        status: LeadStatus.QUALIFIED,
        extractData: () => ({ fgtsBalance: value }),
      };
    }
    return { nextStage: ConversationStage.FGTS_BALANCE };
  },

  [ConversationStage.SIMULATION]: (msg) => {
    if (isPositive(msg)) {
      return {
        nextStage: ConversationStage.DATA_COLLECTION_NAME,
        status: LeadStatus.COLLECTING_DATA,
      };
    }
    return { nextStage: ConversationStage.SIMULATION };
  },

  [ConversationStage.DATA_COLLECTION_NAME]: (msg) => {
    const name = msg.trim();
    if (name.length >= 3 && name.includes(' ')) {
      return {
        nextStage: ConversationStage.DATA_COLLECTION_CPF,
        extractData: () => ({ name }),
      };
    }
    return {
      nextStage: ConversationStage.DATA_COLLECTION_NAME,
      validate: () => 'Preciso do nome completo (nome e sobrenome).',
    };
  },

  [ConversationStage.DATA_COLLECTION_CPF]: (msg) => {
    const cpf = cleanCpf(msg);
    if (isValidCpf(cpf)) {
      return {
        nextStage: ConversationStage.DATA_COLLECTION_BIRTH,
        extractData: () => ({ cpf }),
      };
    }
    return {
      nextStage: ConversationStage.DATA_COLLECTION_CPF,
      validate: () => 'CPF invalido. Pode digitar novamente?',
    };
  },

  [ConversationStage.DATA_COLLECTION_BIRTH]: (msg) => {
    const date = extractDate(msg);
    if (date) {
      return {
        nextStage: ConversationStage.DATA_COLLECTION_PIX,
        extractData: () => ({ birthDate: date }),
      };
    }
    return {
      nextStage: ConversationStage.DATA_COLLECTION_BIRTH,
      validate: () => 'Nao entendi a data. Pode mandar no formato DD/MM/AAAA?',
    };
  },

  [ConversationStage.DATA_COLLECTION_PIX]: (msg) => {
    if (msg.trim().length >= 3) {
      return {
        nextStage: ConversationStage.CONFIRMATION,
        status: LeadStatus.DATA_COMPLETE,
        extractData: () => ({ pixKey: msg.trim() }),
      };
    }
    return { nextStage: ConversationStage.DATA_COLLECTION_PIX };
  },

  [ConversationStage.CONFIRMATION]: (msg) => {
    if (isPositive(msg)) {
      return {
        nextStage: ConversationStage.SUBMISSION,
        status: LeadStatus.SUBMITTED,
      };
    }
    return {
      nextStage: ConversationStage.DATA_COLLECTION_NAME,
      status: LeadStatus.COLLECTING_DATA,
    };
  },

  [ConversationStage.WAITING_RESULT]: () => ({
    nextStage: ConversationStage.WAITING_RESULT,
  }),

  [ConversationStage.RESULT_APPROVED]: () => ({
    nextStage: ConversationStage.RESULT_APPROVED,
  }),

  [ConversationStage.RESULT_REJECTED]: () => ({
    nextStage: ConversationStage.RESULT_REJECTED,
  }),
};
