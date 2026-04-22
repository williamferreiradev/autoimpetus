export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string
                    name: string
                    remotejid: string
                    about: string | null
                    created_at: string
                    updated_at: string
                    followUp: boolean | null
                    Ativado: boolean | null
                    followupEstagio: number | null
                    score: string | null
                    estagiokanbam: string | null
                    estagiopergunta: string | null
                    vertical: string | null
                    qualification_data: string | null
                    is_qualified: boolean | null
                    meeting_scheduled_at: string | null
                    last_followup: string | null
                    ultimamensagemusuario: string | null
                    media_url: string | null
                    metadata: any | null
                }
                Insert: any
                Update: any
            }
            usuario: {
                Row: {
                    user_id: string
                    nome: string
                    email: string
                }
                Insert: any
                Update: any
            }
            relatorio: {
                Row: {
                    id: number
                    created_at: string
                    texto: string | null
                    lido: boolean | null
                }
                Insert: any
                Update: any
            }
            n8n_chat_histories: {
                Row: {
                    id: number
                    session_id: string
                    message: Json
                }
                Insert: any
                Update: any
            }
        }
    }
}
