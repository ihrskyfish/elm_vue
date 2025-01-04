import { createRouter, createWebHistory } from 'vue-router'
import HomePage from "@/views/HomePage.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomePage
        },
        {
            path: '/merchant-info/:merchantId',
            name: 'MerchantInfo',
            component: () => import('../views/MerchantInfo.vue'),
            meta: { hideFooter: true } // 添加元信息，用于判断是否显示底部导航
        },
        {
            path: '/merchant-list',
            name: 'MerchantList',
            component: () => import('../views/MerchantList.vue')
        },
        {
            path: '/order/:orderId',
            name: 'Order',
            component: () => import('../views/Order.vue'),
            meta: { hideFooter: true } // 添加元信息，用于判断是否显示底部导航
        },
        {
            path: '/order-list',
            name: 'OrderList',
            component: () => import('../views/OrderList.vue'),
        },
        {
            path: '/payment/:orderId',
            name: 'Payment',
            component: () => import('../views/Payment.vue'),
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('../views/Login.vue'),
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('../views/Register.vue'),
        },
        {
            path: '/mine',
            name: 'Mine',
            component: () => import('../views/Mine.vue'),
        },
        {
            path: '/address',
            name: 'Address',
            component: () => import('../views/UserAddress.vue'),
        },
        {
            path: '/bussiness-type/:typeId',
            name: 'MerchantType',
            component: () => import('../views/MerchantTypeList.vue'),
        },

    ],
    scrollBehavior() {
        // 总是滚动到顶部
        return { top: 0 }
    }
})

export default router
