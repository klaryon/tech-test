import axios from 'axios';

const productsDB = axios.create({
    baseURL: 'https://628b46b07886bbbb37b46173.mockapi.io/api/v1',
})

export default productsDB;