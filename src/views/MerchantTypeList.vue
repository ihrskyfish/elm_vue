<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRoute } from "vue-router";

interface Merchant {
  merchantAddress: string;
  merchantExplain: string;
  merchantId: number;
  merchantImg: string;
  merchantName: string;
  deliveryPrice: number;
  orderTypeId: number;
  remarks: string;
  starPrice: number;
}

const merchantes = ref<Merchant[]>([]);
const route = useRoute();
const orderTypeId = route.params.typeId; // 正确获取路由参数

const listMerchantByOrderTypeId = async (orderTypeId: number) => {
  try {
    const response = await axios.get(`/api/merchant/lists/${orderTypeId}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Error fetching merchantes:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error making request:', error);
  }
};

onMounted(async () => {
  try {
    const response = await listMerchantByOrderTypeId(Number(orderTypeId));
    if (response && response.data) {
      merchantes.value = response.data as Merchant[];
    }
  } catch (error) {
    console.error('Error fetching merchantes:', error);
  }
});
</script>

<template>

  <body>
    <div class="w=full h-full">

      <!--header部分-->
      <header
        class="w-full h-24 bg-[#0097FFFF] text-white text-4xl fixed left-0 top-0 z-50 flex justify-center items-center">
        <p>商家列表</p>
      </header>

      <!--商家列表部分-->
      <!-- 商家列表部分 -->
      <ul class="w-full mt-24">
        <RouterLink v-for="merchant in merchantes" :key="merchant.merchantId"
          :to="`/merchant-info/${merchant.merchantId}`" class="block w-full">
          <li class="w-full p-6 select-none flex items-center cursor-pointer border-solid border-b border-gray-300">
            <div class="relative items-center">
              <img :src="merchant.merchantImg || '/src/assets/img/default.png'" alt="" class="w-[20vw] h-[20vw]">
            </div>
            <div class="ml-5">
              <h3 class="text-3xl text-gray-600 font-semibold leading-relaxed ">{{ merchant.merchantName }}</h3>
              <p class="text-2xl text-gray-500 font-medium leading-relaxed mt-1">&#165;{{ merchant.starPrice }}起送 |
                &#165;{{ merchant.deliveryPrice }}配送</p>
              <p class="text-2xl text-gray-500 font-medium leading-relaxed mt-1">{{ merchant.merchantExplain }}</p>
            </div>
          </li>
        </RouterLink>
      </ul>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
    </div>
  </body>
</template>

<style scoped></style>
