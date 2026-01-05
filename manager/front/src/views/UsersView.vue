<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { apiService, type User, type CreateUserRequest, type UpdateUserRequest } from '../services/api'

const authStore = useAuthStore()

// State
const users = ref<User[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const sortBy = ref<'username' | 'email' | 'role' | 'createdAt'>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<User | null>(null)

// Form data
const createForm = ref<CreateUserRequest>({
  username: '',
  email: '',
  password: '',
  role: 'user'
})

const editForm = ref<UpdateUserRequest>({})

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    let aValue: any = a[sortBy.value]
    let bValue: any = b[sortBy.value]

    if (sortBy.value === 'createdAt') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    } else {
      aValue = aValue?.toString().toLowerCase() || ''
      bValue = bValue?.toString().toLowerCase() || ''
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return filtered
})

// Methods
const loadUsers = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await apiService.getUsers()
    if (response.success && response.users) {
      users.value = response.users
    } else {
      error.value = response.error || '載入用戶列表失敗'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入用戶列表失敗'
  } finally {
    isLoading.value = false
  }
}

const handleSort = (column: typeof sortBy.value) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const openCreateModal = () => {
  createForm.value = {
    username: '',
    email: '',
    password: '',
    role: 'user'
  }
  showCreateModal.value = true
}

const openEditModal = (user: User) => {
  selectedUser.value = user
  editForm.value = {
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  }
  showEditModal.value = true
}

const openDeleteModal = (user: User) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedUser.value = null
  error.value = ''
}

const validatePassword = (password: string): string[] => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('密碼長度至少需要 8 個字符')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('密碼需要包含至少一個小寫字母')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('密碼需要包含至少一個大寫字母')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('密碼需要包含至少一個數字')
  }
  
  return errors
}

const handleCreateUser = async () => {
  if (!createForm.value.username || !createForm.value.email || !createForm.value.password) {
    error.value = '請填寫所有必填欄位'
    return
  }

  const passwordErrors = validatePassword(createForm.value.password)
  if (passwordErrors.length > 0) {
    error.value = passwordErrors.join('、')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await apiService.createUser(createForm.value)
    if (response.success) {
      await loadUsers()
      closeModals()
    } else {
      error.value = response.error || '創建用戶失敗'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '創建用戶失敗'
  } finally {
    isLoading.value = false
  }
}

const handleUpdateUser = async () => {
  if (!selectedUser.value) return

  if (editForm.value.password) {
    const passwordErrors = validatePassword(editForm.value.password)
    if (passwordErrors.length > 0) {
      error.value = passwordErrors.join('、')
      return
    }
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await apiService.updateUser(selectedUser.value.id, editForm.value)
    if (response.success) {
      await loadUsers()
      closeModals()
    } else {
      error.value = response.error || '更新用戶失敗'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '更新用戶失敗'
  } finally {
    isLoading.value = false
  }
}

const handleDeleteUser = async () => {
  if (!selectedUser.value) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await apiService.deleteUser(selectedUser.value.id)
    if (response.success) {
      await loadUsers()
      closeModals()
    } else {
      error.value = response.error || '刪除用戶失敗'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '刪除用戶失敗'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

const getRoleText = (role: string) => {
  return role === 'admin' ? '管理員' : '用戶'
}

const getStatusText = (isActive: boolean) => {
  return isActive ? '啟用' : '停用'
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="users-view">
    <div class="page-header">
      <h1>用戶管理</h1>
      <button @click="openCreateModal" class="btn btn-primary">
        <span class="icon">➕</span>
        新增用戶
      </button>
    </div>

    <!-- Search and filters -->
    <div class="filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜尋用戶名、信箱或角色..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && users.length === 0" class="loading">
      載入中...
    </div>

    <!-- Users table -->
    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th @click="handleSort('username')" class="sortable">
              用戶名
              <span class="sort-indicator" v-if="sortBy === 'username'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="handleSort('email')" class="sortable">
              信箱
              <span class="sort-indicator" v-if="sortBy === 'email'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="handleSort('role')" class="sortable">
              角色
              <span class="sort-indicator" v-if="sortBy === 'role'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>狀態</th>
            <th>最後登入</th>
            <th @click="handleSort('createdAt')" class="sortable">
              創建時間
              <span class="sort-indicator" v-if="sortBy === 'createdAt'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <div class="user-info">
                <span class="username">{{ user.username }}</span>
                <span v-if="user.mustChangePassword" class="password-warning">需要變更密碼</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="{ active: user.isActive }">
                {{ getStatusText(user.isActive) }}
              </span>
            </td>
            <td>{{ user.lastLogin ? formatDate(user.lastLogin) : '從未登入' }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="actions">
                <button @click="openEditModal(user)" class="btn btn-sm btn-secondary">
                  編輯
                </button>
                <button 
                  @click="openDeleteModal(user)" 
                  class="btn btn-sm btn-danger"
                  :disabled="user.id === authStore.user?.id"
                >
                  刪除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredUsers.length === 0 && !isLoading" class="no-data">
        {{ searchQuery ? '沒有找到符合條件的用戶' : '暫無用戶資料' }}
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>新增用戶</h2>
          <button @click="closeModals" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="handleCreateUser" class="modal-body">
          <div class="form-group">
            <label>用戶名 *</label>
            <input
              v-model="createForm.username"
              type="text"
              required
              :disabled="isLoading"
              placeholder="請輸入用戶名"
            />
          </div>
          
          <div class="form-group">
            <label>信箱 *</label>
            <input
              v-model="createForm.email"
              type="email"
              required
              :disabled="isLoading"
              placeholder="請輸入信箱"
            />
          </div>
          
          <div class="form-group">
            <label>密碼 *</label>
            <input
              v-model="createForm.password"
              type="password"
              required
              :disabled="isLoading"
              placeholder="請輸入密碼"
            />
            <div class="password-requirements">
              <p>密碼要求：至少 8 個字符，包含大小寫字母和數字</p>
            </div>
          </div>
          
          <div class="form-group">
            <label>角色</label>
            <select v-model="createForm.role" :disabled="isLoading">
              <option value="user">用戶</option>
              <option value="admin">管理員</option>
            </select>
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn btn-secondary" :disabled="isLoading">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? '創建中...' : '創建用戶' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>編輯用戶</h2>
          <button @click="closeModals" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="handleUpdateUser" class="modal-body">
          <div class="form-group">
            <label>用戶名</label>
            <input
              v-model="editForm.username"
              type="text"
              :disabled="isLoading"
              placeholder="請輸入用戶名"
            />
          </div>
          
          <div class="form-group">
            <label>信箱</label>
            <input
              v-model="editForm.email"
              type="email"
              :disabled="isLoading"
              placeholder="請輸入信箱"
            />
          </div>
          
          <div class="form-group">
            <label>新密碼（留空表示不變更）</label>
            <input
              v-model="editForm.password"
              type="password"
              :disabled="isLoading"
              placeholder="請輸入新密碼"
            />
            <div class="password-requirements">
              <p>密碼要求：至少 8 個字符，包含大小寫字母和數字</p>
            </div>
          </div>
          
          <div class="form-group">
            <label>角色</label>
            <select v-model="editForm.role" :disabled="isLoading">
              <option value="user">用戶</option>
              <option value="admin">管理員</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="editForm.isActive"
                type="checkbox"
                :disabled="isLoading"
              />
              啟用帳號
            </label>
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn btn-secondary" :disabled="isLoading">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? '更新中...' : '更新用戶' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete User Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>刪除用戶</h2>
          <button @click="closeModals" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <p>確定要刪除用戶 <strong>{{ selectedUser?.username }}</strong> 嗎？</p>
          <p class="warning">此操作無法復原！</p>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="modal-actions">
            <button @click="closeModals" class="btn btn-secondary" :disabled="isLoading">
              取消
            </button>
            <button @click="handleDeleteUser" class="btn btn-danger" :disabled="isLoading">
              {{ isLoading ? '刪除中...' : '確定刪除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
}

.filters {
  margin-bottom: 24px;
}

.search-box {
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 48px;
  color: #6b7280;
  font-size: 16px;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background-color: #f9fafb;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.users-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.users-table th.sortable:hover {
  background-color: #f3f4f6;
}

.sort-indicator {
  margin-left: 8px;
  color: #3b82f6;
  font-weight: bold;
}

.users-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.users-table tbody tr:hover {
  background-color: #f9fafb;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 500;
}

.password-warning {
  font-size: 12px;
  color: #f59e0b;
  background-color: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.role-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.role-badge.admin {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.role-badge.user {
  background-color: #f3f4f6;
  color: #374151;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge:not(.active) {
  background-color: #fef2f2;
  color: #dc2626;
}

.actions {
  display: flex;
  gap: 8px;
}

.no-data {
  text-align: center;
  padding: 48px;
  color: #6b7280;
  font-size: 16px;
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.icon {
  font-size: 16px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s, background-color 0.2s;
}

.close-btn:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.modal-body {
  padding: 0 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto !important;
  margin: 0;
}

.password-requirements {
  margin-top: 6px;
}

.password-requirements p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.warning {
  color: #dc2626;
  font-weight: 500;
  margin: 8px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* Responsive design */
@media (max-width: 768px) {
  .users-view {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 800px;
  }
  
  .modal {
    margin: 16px;
    max-width: none;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .users-view {
    padding: 12px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .modal-header,
  .modal-body {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>