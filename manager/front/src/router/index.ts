import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import ConfigView from '../views/ConfigView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { requiresAuth: false }
        },
        {
            path: '/',
            component: AdminLayout,
            children: [
                {
                    path: '',
                    redirect: '/config'
                },
                {
                    path: 'config',
                    name: 'config',
                    component: ConfigView
                }
            ],
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    } else if (to.name === 'login' && authStore.isAuthenticated) {
        next('/config')
    } else {
        next()
    }
})

export default router
