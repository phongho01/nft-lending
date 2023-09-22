import axios from 'axios';

const env = import.meta.env.VITE_ENVIRONMENT;

const API_URL = {
  development: 'http://localhost:3000',
  production: 'http://18.142.250.16:3000',
};

const instance = axios.create({
  baseURL: API_URL[env],
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
