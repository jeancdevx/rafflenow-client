export type RaffleStatus = 'active' | 'processing' | 'completed' | 'cancelled'

export type RaffleCategory = 'pequeño' | 'mediano' | 'grande' | 'premium'

export interface Raffle {
  raffle_id: string
  title: string
  description: string
  status: RaffleStatus
  start_date: string
  end_date: string
  prize_value: number
  category: RaffleCategory
  prize_images: string[]
  max_participants: number
  current_participants: number
  created_at: string
  updated_at: string
}

export interface ActiveRaffleDetail extends Raffle {
  status: 'active'
  user_has_participated: boolean
  participation_percentage: number
  days_remaining: number
  can_participate: boolean
}

export interface ProcessingRaffleDetail extends Raffle {
  status: 'processing'
  user_has_participated: boolean
  participation_percentage: 100
  days_remaining: 0
  can_participate: false
  message: string
}

export interface CompletedRaffleDetail extends Raffle {
  status: 'completed'
  user_has_participated: boolean
  total_participants: number
  winner_name: string | null
  winner_selected_at: string | null
  completed_at: string | null
  participation_percentage: 100
  days_remaining: 0
  can_participate: false
}

export interface CancelledRaffleDetail extends Raffle {
  status: 'cancelled'
  user_has_participated: boolean
  cancellation_reason: string
  cancelled_at: string | null
  cancelled_by: string | null
  participation_percentage: number
  days_remaining: 0
  can_participate: false
}

export type RaffleDetail =
  | ActiveRaffleDetail
  | ProcessingRaffleDetail
  | CompletedRaffleDetail
  | CancelledRaffleDetail

export interface ListRafflesResponse {
  message: string
  raffles: Raffle[]
  count: number
  has_more: boolean
  next_cursor: string | null
  scanned_count: number
}

export interface CreateRaffleInput {
  title: string
  description: string
  prize_value: number
  prize_images: string[]
}

export interface CreateRaffleResponse {
  message: string
  raffle: Raffle & {
    created_by: string
  }
}

export interface ParticipateResponse {
  message: string
  raffle_id: string
  participant_email: string
}

export interface CloseRaffleResponse {
  message: string
  raffle: Raffle & {
    closed_by: string
    closed_at: string
  }
}

export interface UploadRequest {
  fileName: string
  fileType: string
  fileSize?: number
}

export interface UploadResponse {
  message: string
  upload: {
    url: string
    method: 'PUT'
    headers: {
      'Content-Type': string
    }
    expiresIn: number
  }
  file: {
    key: string
    cloudFrontUrl: string
    originalUrl: string
    fileName: string
  }
  instructions: string[]
}

export interface ApiError {
  message: string
  error?: string
  current_length?: number
  participated_at?: string
}
