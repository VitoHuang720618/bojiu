import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import ChangePasswordView from '../views/ChangePasswordView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import ConfigView from '../views/ConfigView.vue'
import UsersView from '../views/UsersView.vue'

// Get base path for container deployment
const getBasePath = () => {
  if (import.meta.env.PROD) {
    return '/admin/'
  }
  return '/'
}

const router = createRouter({
    history: createWebHistory(getBasePath()),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { requiresAuth: false }
        },
        {
            path: '/change-password',
            name: 'change-password',
            component: ChangePasswordView,
            meta: { requiresAuth: true, requiresPasswordChange: true }
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
                },
                {
                    path: 'users',
                    name: 'users',
                    component: UsersView,
                    meta: { requiresAdmin: true }
                }
            ],
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // Initialize auth state if not already done
    if (!authStore.user && authStore.token) {
        await authStore.initializeAuth()
    }

    // Handle authentication requirements
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
        return
    }

    // Redirect authenticated users away from login
    if (to.name === 'login' && authStore.isAuthenticated) {
        // Check if user needs to change password
        if (authStore.user?.mustChangePassword) {
            next('/change-password')
        } else {
            next('/config')
        }
        return
    }

    // Handle password change requirement
    if (authStore.isAuthenticated && authStore.user?.mustChangePassword) {
        if (to.name !== 'change-password') {
            next('/change-password')
            return
        }
    }

    // Prevent access to change-password page if password change is not required
    if (to.name === 'change-password' && authStore.isAuthenticated && !authStore.user?.mustChangePassword) {
        next('/config')
        return
    }

    // Handle admin-only routes
    if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
        next('/config') // Redirect non-admin users to config page
        return
    }

    next()
})

export default router
