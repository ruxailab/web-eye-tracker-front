import axios from 'axios'
import { envConfig } from '../config/environment'

axios.defaults.baseURL = envConfig.apiBaseUrl
