export type CrmStatus = 'novo' | 'em_contato' | 'qualificado' | 'convertido' | 'perdido';

export interface Cliente {
    id: string; // uuid
    name: string;
    remotejid: string; // unique (WhatsApp ID)
    about: string | null;
    created_at: string; // timestamp
    updated_at: string; // timestamp
    followUp: boolean; // default false
    Ativado: boolean; // default true
    followupEstagio: number; // bigint
    score: string | null;
    estagiokanbam: string; // default 'novo'
    estagiopergunta: string; // default 'nome'
    vertical: string; // default 'imobiliaria'
    qualification_data: string | null;
    is_qualified: boolean; // default false
    meeting_scheduled_at: string | null;
    last_followup: string | null;
    ultimamensagemusuario: string | null;
    media_url: string | null;
    metadata?: any;
    status_crm?: string;
    qualificado?: boolean;
    trava?: boolean;
}

export interface Relatorio {
    id: number;
    created_at: string;
    texto: string | null;
    lido: boolean;
}

export interface ChatHistory {
    id: number;
    session_id: string;
    message: any; // jsonb
}
