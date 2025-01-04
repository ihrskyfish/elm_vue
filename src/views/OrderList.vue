<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { getToken } from "@/authService";

interface MerchantVo {
  merchantAddress: string;
  merchantExplain: string;
  merchantId: number;
  merchantImg: string;
  merchantName: string;
  deliveryPrice: number;
  orderQuantity: number;
  orderTypeId: number;
  remarks: string;
  starPrice: number;
}

interface FoodVo {
  merchantId: number;
  foodExplain: string;
  foodId: number;
  foodImg: string;
  foodName: string;
  foodPrice: number;
  remarks: string;
}

interface OrderDetailetVo {
  foodId: number;
  food: FoodVo;
  odId: number;
  orderId: number;
  quantity: number;
}

interface OrdersVo {
  merchantId: number;
  merchantVo: MerchantVo | null;
  daId: number;
  list: OrderDetailetVo[];
  orderDate: string;
  orderId: number;
  orderState: number;
  orderTotal: number;
  userId: string;
  show: boolean;
}

let page = ref(1);
const size = 10;
let hasMore = ref(true);

const listOrdersByUserId = async (page: number, size: number) => {
  try {
    const response = await axios.get('/api/orders/lists', {
      params: { page, size },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'token': getToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};
const getMerchantById = async (merchantId: number) => {
  try {
    const response = await axios.get(`/api/merchant/merchantes/${merchantId}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'token': getToken(),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching merchant:', error);
    throw error;
  }
};
const fetchOrderDetails = async (orderId: number) => {
  try {
    const response = await axios.get('/api/orders/listsDetailet', {
      params: { orderId },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'token': getToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};
const orders = ref<OrdersVo[]>([]);

// ...

// Remove fetchOrderDetails from fetchAndFillOrdersData
const fetchAndFillOrdersData = async (append = false) => {
  try {
    const ordersResponse = await listOrdersByUserId(page.value, size);
    if (ordersResponse.code === 200 && Array.isArray(ordersResponse.data)) {
      const newOrders = await Promise.all(ordersResponse.data.map(async (order: OrdersVo) => {
        let merchantInfo = order.merchantVo;

        if (merchantInfo === null && order.merchantId) {
          const merchantResponse = await getMerchantById(order.merchantId);
          if (merchantResponse.code === 200 && merchantResponse.data) {
            merchantInfo = merchantResponse.data;
          }
        }

        return { ...order, merchantVo: merchantInfo, list: [], show: false };
      }));

      if (append) {
        orders.value.push(...newOrders);
      } else {
        orders.value = newOrders;
      }

      // Check if there might be more orders
      hasMore.value = ordersResponse.data.length === size;
    }
  } catch (error) {
    console.error('Error fetching and filling orders data:', error);
  }
};

const toggleOrderDetails = async (orderId: number) => {
  // Find the order
  const order = orders.value.find(order => order.orderId === orderId);
  if (order) {
    if (order.show) {
      // If the order details are already shown, just hide them
      order.show = false;
    } else {
      // If the order details are not shown, fetch them and then show them
      const orderDetailsResponse = await fetchOrderDetails(order.orderId);
      if (orderDetailsResponse.code === 200 && orderDetailsResponse.data) {
        order.list = orderDetailsResponse.data;
      }
      order.show = true;
    }
  }
};

// ...


onMounted(() => {
  fetchAndFillOrdersData();

  window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      // User has scrolled to the bottom of the page
      page.value += 1;
      fetchAndFillOrdersData(true);
    }
  });
});

</script>


<template>

  <body>
    <div class="w-full h-full">

      <!--header部分-->
      <header
        class="w-full h-24 bg-[#0097FFFF] text-white text-4xl fixed left-0 top-0 z-50 flex justify-center items-center">
        <p class="">我的订单</p>
      </header>

      <!--订单列表部分-->
      <h3 class=" mt-24 box-border p-[4vw] text-3xl font-light text-[#999999FF]">未支付订单信息：</h3>
      <ul class="w-full">
        <li v-for="order in orders" :key="order.orderId" class="w-full text-3xl">
          <div v-if="order.orderState === 0"
            class="box-border py-[2vw] px-[4vw] text-[#666666FF] flex justify-between items-center">
            <p class="flex flex-row justify-between items-center">
              {{ order.merchantVo ? order.merchantVo.merchantName : '' }}
              <svg class="fa-caret-down" height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg"
                @click="toggleOrderDetails(order.orderId)">
                <path d="m24 12l-8 10l-8-10z" fill="currentColor" />
              </svg>
            </p>
            <div class="flex">
              <p class="">&#165;{{ order.orderTotal + (order.merchantVo?.deliveryPrice || 0) }}</p>
              <RouterLink :to="`/payment/${order.orderId}`" class="block w-full h-full">
                <button class="bg-[#FF9900FF] text-white rounded-[3px] ml-4 select-none cursor-pointer">去支付
                </button>
              </RouterLink>
            </div>
          </div>
          <ul v-if="order.orderState === 0" v-show="order.show" class="w-full order-detailet">
            <li v-for="detail in order.list" :key="detail.odId"
              class="w-full box-border py-[1vw] px-[4vw] text-[#666666FF] text-xl flex justify-between items-center">
              <p class="">{{ detail.food.foodName }}*{{ detail.quantity }}</p>
              <p class="">&#165;{{ detail.food.foodPrice * detail.quantity }}</p>
            </li>
            <li class="w-full box-border py-[1vw] px-[4vw] text-[#666666FF] text-xl flex justify-between items-center">
              <p class="">配送费</p>
              <p class="">&#165;{{ order.merchantVo ? order.merchantVo.deliveryPrice : '' }}</p>
            </li>
          </ul>
        </li>

      </ul>

      <h3 class=" mt-24 box-border p-[4vw] text-3xl font-light text-[#999999FF]">已支付订单信息：</h3>
      <ul class="w-full">
        <li v-for="order in orders" :key="order.orderId" class="w-full text-3xl">
          <div v-if="order.orderState === 1"
            class="box-border py-[2vw] px-[4vw] text-[#666666FF] flex justify-between items-center">
            <p class="flex flex-row justify-between items-center">
              {{ order.merchantVo ? order.merchantVo.merchantName : '' }}
              <svg class="fa-caret-down" height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg"
                @click="toggleOrderDetails(order.orderId)">
                <path d="m24 12l-8 10l-8-10z" fill="currentColor" />
              </svg>
            </p>
            <div class="flex">
              <p class="">&#165;{{ order.orderTotal + (order.merchantVo?.deliveryPrice || 0) }}</p>
              <RouterLink class="block w-full h-full" to="/">
                <button class="bg-green-500 text-white rounded-[3px] ml-4 select-none cursor-pointer">去评价
                </button>
              </RouterLink>
            </div>
          </div>
          <ul v-if="order.orderState === 1" v-show="order.show" class="w-full order-detailet">
            <li v-for="detail in order.list" :key="detail.odId"
              class="w-full box-border py-[1vw] px-[4vw] text-[#666666FF] text-xl flex justify-between items-center">
              <p class="">{{ detail.food.foodName }} *{{ detail.quantity }}</p>
              <p class="">&#165;{{ detail.food.foodPrice * detail.quantity }}</p>
            </li>
            <li class="w-full box-border py-[1vw] px-[4vw] text-[#666666FF] text-xl flex justify-between items-center">
              <p class="">配送费</p>
              <p class="">&#165;{{ order.merchantVo ? order.merchantVo.deliveryPrice : '' }}</p>
            </li>
          </ul>
        </li>

      </ul>
    </div>
    <div v-if="hasMore" class="w-full p-[4vw] text-3xl font-light text-[#999999FF] flex justify-between items-center">
      <p class="text-gray-600 w-full">下拉展示更多订单</p>
    </div>
    <div v-if="!hasMore" class="w-full p-[4vw] text-3xl font-light text-[#999999FF] flex justify-between items-center">
      <p class="text-gray-600 w-full">订单已全部加载</p>
    </div>
    <div>&nbsp</div>
    <div>&nbsp</div>
    <div>&nbsp</div>
    <div>&nbsp</div>
    <div>&nbsp</div>
    <div>&nbsp</div>
  </body>
</template>

<style scoped></style>
