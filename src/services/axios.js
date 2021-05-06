import axios from 'axios'

axios.defaults.baseURL = process.env.NODE_ENV == 'production' ? 'https://web-eye-tracker-1204.herokuapp.com/' : 'http://localhost:5000'
