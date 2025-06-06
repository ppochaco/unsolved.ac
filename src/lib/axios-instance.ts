import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const TIMEOUT = 2000

export const initInstance = (config: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    timeout: TIMEOUT,
    ...config,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...config.headers,
    },
  })

  return instance
}
