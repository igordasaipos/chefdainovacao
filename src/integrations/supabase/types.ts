export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          nome: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          ativo: boolean | null
          configuracao: Json | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          nome: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          configuracao?: Json | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          configuracao?: Json | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ideias: {
        Row: {
          admin_criador: string | null
          complexidade: string
          criado_em: string
          criado_por: string | null
          descricao: string | null
          desenvolvedor: string | null
          evento_id: string
          id: string
          jira: string | null
          nome_cliente: string | null
          nome_restaurante: string | null
          observacao: string | null
          status: string
          tipo_cliente: string | null
          titulo: string
          votos: number
          whatsapp_caixinha_enviado: boolean
          whatsapp_criador: string | null
          whatsapp_desenvolvimento_enviado: boolean
          whatsapp_finalizado_enviado: boolean
          whatsapp_votacao_enviado: boolean
        }
        Insert: {
          admin_criador?: string | null
          complexidade: string
          criado_em?: string
          criado_por?: string | null
          descricao?: string | null
          desenvolvedor?: string | null
          evento_id: string
          id?: string
          jira?: string | null
          nome_cliente?: string | null
          nome_restaurante?: string | null
          observacao?: string | null
          status?: string
          tipo_cliente?: string | null
          titulo: string
          votos?: number
          whatsapp_caixinha_enviado?: boolean
          whatsapp_criador?: string | null
          whatsapp_desenvolvimento_enviado?: boolean
          whatsapp_finalizado_enviado?: boolean
          whatsapp_votacao_enviado?: boolean
        }
        Update: {
          admin_criador?: string | null
          complexidade?: string
          criado_em?: string
          criado_por?: string | null
          descricao?: string | null
          desenvolvedor?: string | null
          evento_id?: string
          id?: string
          jira?: string | null
          nome_cliente?: string | null
          nome_restaurante?: string | null
          observacao?: string | null
          status?: string
          tipo_cliente?: string | null
          titulo?: string
          votos?: number
          whatsapp_caixinha_enviado?: boolean
          whatsapp_criador?: string | null
          whatsapp_desenvolvimento_enviado?: boolean
          whatsapp_finalizado_enviado?: boolean
          whatsapp_votacao_enviado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ideias_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes_newsletter: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      kv_store_08b9cd48: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      votos: {
        Row: {
          created_at: string
          eh_cliente: boolean
          id: string
          ideia_id: string
          nome_restaurante_votante: string
          nome_votante: string
          telefone_votante: string
          whatsapp_votante: string
        }
        Insert: {
          created_at?: string
          eh_cliente?: boolean
          id?: string
          ideia_id: string
          nome_restaurante_votante: string
          nome_votante?: string
          telefone_votante: string
          whatsapp_votante: string
        }
        Update: {
          created_at?: string
          eh_cliente?: boolean
          id?: string
          ideia_id?: string
          nome_restaurante_votante?: string
          nome_votante?: string
          telefone_votante?: string
          whatsapp_votante?: string
        }
        Relationships: [
          {
            foreignKeyName: "votos_ideia_id_fkey"
            columns: ["ideia_id"]
            isOneToOne: false
            referencedRelation: "ideias"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          status: string
          template: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          status: string
          template: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          status?: string
          template?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: { email: string; password: string }
        Returns: string
      }
      get_user_permissions: {
        Args: { user_email: string }
        Returns: {
          permission_name: string
        }[]
      }
      get_user_role: {
        Args: { user_email: string }
        Returns: {
          role_description: string
          role_name: string
        }[]
      }
      user_has_permission: {
        Args: { permission_name: string; user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
