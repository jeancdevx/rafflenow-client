import type {
  ListRafflesResponse,
  RaffleDetail,
  RaffleStatus
} from '@/types/raffle'
import { publicFetch } from './api-client'

interface ListRafflesParams {
  status?: RaffleStatus
  limit?: number
  cursor?: string
}

export async function listRaffles(params: ListRafflesParams = {}) {
  const searchParams = new URLSearchParams()

  if (params.status) {
    searchParams.append('status', params.status)
  }
  if (params.limit) {
    searchParams.append('limit', params.limit.toString())
  }
  if (params.cursor) {
    searchParams.append('cursor', params.cursor)
  }

  const query = searchParams.toString()
  const endpoint = `/api/v1/public/raffles${query ? `?${query}` : ''}`

  return publicFetch<ListRafflesResponse>(endpoint)
}

export async function getRaffleById(id: string, token?: string) {
  const options = token ? { headers: { Authorization: token } } : {}
  return publicFetch<RaffleDetail>(`/api/v1/public/raffles/${id}`, options)
}
