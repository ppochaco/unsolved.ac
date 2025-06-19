import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const initInstance = (config: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    ...config,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...config.headers,
    },
  })

  return instance
}

const solvedAcApi = initInstance({
  baseURL: 'https://solved.ac',
})

export { solvedAcApi }
