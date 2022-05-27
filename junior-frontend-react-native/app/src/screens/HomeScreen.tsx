import React, { useEffect } from 'react'
import { SafeAreaView, ScrollView, Text } from 'react-native'
import { Carousel } from '../components/Carousel'
import productsDB from '../api/productsDB';

export interface ProductsDBResponse {
    image: string,
    id: string
}

export const HomeScreen = () => {
    // const getProductsDetails = async() => {
    //     const productDetailsResponse = productsDB.get<ProductsDBResponse>('/products');
    // }

    // useEffect(() => {
    //     productsDB.get('/products').then(resp => {
    //         console.log(resp.data)
    //     });
    // })

  return (
      <SafeAreaView>
        <ScrollView>
            <Text>Rand-Network junior test Clarissa :D</Text>
            {/* <Carousel /> */}
        </ScrollView>
      </SafeAreaView>
  )
}
