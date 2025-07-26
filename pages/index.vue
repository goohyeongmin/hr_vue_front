<template>
  <div class="login-container">
    <!-- 로그인하지 않은 상태 -->
    <div v-if="!isLoggedIn" class="login-section">
      <h1 class="mb-6 text-center">insaHome</h1>
      
      <!-- 로그인 화면 -->
      <v-card v-if="currentView === 'login'" class="mx-auto login-card" max-width="400">
        <v-card-title class="text-center pa-6">
          <v-icon icon="mdi-account-circle" size="64" class="mb-2"></v-icon>
          <div class="text-h5">로그인</div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="loginForm.username"
              label="사용자 ID"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              class="mb-4"
              :error-messages="loginError ? '아이디 또는 비밀번호를 확인해주세요' : ''"
            ></v-text-field>
            
            <v-text-field
              v-model="loginForm.password"
              label="비밀번호"
              type="password"
              prepend-inner-icon="mdi-lock"
              variant="outlined"
              class="mb-4"
              :error-messages="loginError ? ' ' : ''"
            ></v-text-field>
            
            <v-checkbox
              v-model="loginForm.rememberMe"
              label="로그인 상태 유지"
              class="mb-4"
            ></v-checkbox>
            
            <v-btn
              type="submit"
              color="primary"
              variant="elevated"
              block
              size="large"
              :loading="isLoading"
            >
              로그인
            </v-btn>
          </v-form>
          
          <v-divider class="my-4"></v-divider>
          
          <div class="text-center">
            <v-btn variant="text" size="small" class="mr-2">
              아이디 찾기
            </v-btn>
            <v-btn variant="text" size="small">
              비밀번호 찾기
            </v-btn>
          </div>
          
          <v-divider class="my-4"></v-divider>
          
          <!-- 회원가입 링크 -->
          <div class="text-center">
            <span class="text-body-2 text-medium-emphasis">아직 계정이 없으신가요?</span>
            <v-btn 
              variant="text" 
              color="primary" 
              size="small"
              class="ml-2"
              @click="goToRegister"
            >
              회원가입
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- 회원가입 화면 -->
      <v-card v-else-if="currentView === 'register'" class="mx-auto login-card" max-width="400">
        <v-card-title class="text-center pa-6">
          <v-icon icon="mdi-account-plus" size="64" class="mb-2"></v-icon>
          <div class="text-h5">회원가입</div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="handleRegister" ref="registerFormRef">
            <v-text-field
              v-model="registerForm.username"
              label="사용자 ID"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              class="mb-4"
              :rules="usernameRules"
              :error-messages="registerError.username"
            ></v-text-field>
            
            <v-text-field
              v-model="registerForm.name"
              label="이름"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              class="mb-4"
              :rules="nameRules"
              :error-messages="registerError.name"
            ></v-text-field>
            
            <v-text-field
              v-model="registerForm.password"
              label="비밀번호"
              type="password"
              prepend-inner-icon="mdi-lock"
              variant="outlined"
              class="mb-4"
              :rules="passwordRules"
              :error-messages="registerError.password"
            ></v-text-field>
            
            <v-text-field
              v-model="registerForm.confirmPassword"
              label="비밀번호 확인"
              type="password"
              prepend-inner-icon="mdi-lock-check"
              variant="outlined"
              class="mb-4"
              :rules="confirmPasswordRules"
              :error-messages="registerError.confirmPassword"
            ></v-text-field>
            <v-text-field
              v-model="registerForm.empCode"
               :rules="empCodeRules"
               label="사원번호"
               placeholder=""
              :error-messages="registerError.empCode"
              required
              />
            <v-btn
              type="submit"
              color="success"
              variant="elevated"
              block
              size="large"
              :loading="isRegisterLoading"
            >
              회원가입
            </v-btn>
          </v-form>
          
          <v-divider class="my-4"></v-divider>
          
          <!-- 로그인으로 돌아가기 링크 -->
          <div class="text-center">
            <span class="text-body-2 text-medium-emphasis">이미 계정이 있으신가요?</span>
            <v-btn 
              variant="text" 
              color="primary" 
              size="small"
              class="ml-2"
              @click="goToLogin"
            >
              로그인
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
      
      <div class="text-center mt-4">
        <small class="text-medium-emphasis">
          *업무관련 문의: 055-753-3677 | 
          <a
            href="http://www.seoulit.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-decoration-none"
          >
            서울IT교육센터
          </a>
        </small>
      </div>

      <!-- 성공/에러 스낵바 -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        :timeout="3000"
        location="top"
      >
        {{ snackbarMessage }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showSnackbar = false">
            닫기
          </v-btn>
        </template>
      </v-snackbar>
    </div>

    <!-- 로그인한 상태 - 기존 홈페이지 -->
    <div v-else>
      <div class="d-flex justify-space-between align-center mb-6">
        <h1>insaHome</h1>
        <div class="d-flex align-center">
          <v-chip color="success" class="mr-3">
            <v-icon start icon="mdi-account-check"></v-icon>
            {{ currentUser.name }}님
          </v-chip>
          <v-btn
            color="error"
            variant="outlined"
            size="small"
            @click="handleLogout"
          >
            로그아웃
          </v-btn>
        </div>
      </div>
      
      <v-card
        class="mb-6"
        title="인사관리페이지🚀"
      >
        <v-card-text>
          인사관리페이지에 오신 여러분을 진심으로 환영합니다.<br>
          여러분의 업적과 성장을 함께 기록하며, 조직의 발전에 동참할 수 있도록 최선을 다하겠습니다.<br>
          <br>
          *업무관련은 아래로 연락해주세요 문의 페이지. 저녁 7시 이후로는 급한용무만 관리자에게 연락 바랍니다.*
        </v-card-text>
        <v-card-text>
          055-753-3677
          <a
            href="http://www.seoulit.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-decoration-none"
          >
            서울IT교육센터
          </a>
        </v-card-text>
      </v-card>

      <!-- 추가 메뉴들 -->
      <v-row>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon icon="mdi-account-group" class="mr-2"></v-icon>
              직원관리
            </v-card-title>
            <v-card-text>
              직원 정보 조회 및 관리
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon icon="mdi-calendar-clock" class="mr-2"></v-icon>
              근태관리
            </v-card-title>
            <v-card-text>
              출퇴근 및 근무시간 관리
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon icon="mdi-chart-line" class="mr-2"></v-icon>
              성과관리
            </v-card-title>
            <v-card-text>
              직원 성과 평가 및 분석
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
//import { fetchAttendanceData } from '@layouts/pages/hr/attndmgmt/daily.vue'
import { useUserStore } from '@/store/hr/affair'

const userStore = useUserStore()
const headerSelectedEmp = ref('')
const attendance = ref({})
// 반응형 데이터
const isLoggedIn = ref(false)
const isLoading = ref(false)
const isRegisterLoading = ref(false)
const loginError = ref(false)
const currentUser = ref({ name: '', id: '' })
const currentView = ref('login') // 'login' 또는 'register'

// 스낵바 관련
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// 폼 참조
const registerFormRef = ref(null)


const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const registerForm = reactive({
  username: '',
  name: '',
  empCode: '',  // empCode 필드 추가
  password: '',
  confirmPassword: ''
})

const registerError = reactive({
  username: '',
  name: '',
  empCode: '',  // empCode 에러 필드 추가
  password: '',
  confirmPassword: ''
})

// 화면 전환 함수
const goToRegister = () => {
  currentView.value = 'register'
  loginError.value = false
  // 로그인 폼 초기화
  loginForm.username = ''
  loginForm.password = ''
  loginForm.rememberMe = false
}

const goToLogin = () => {
  currentView.value = 'login'
  // 회원가입 폼 초기화 및 에러 클리어
  Object.keys(registerForm).forEach(key => {
    registerForm[key] = ''
  })
  Object.keys(registerError).forEach(key => {
    registerError[key] = ''
  })
}

// 밸리데이션 규칙
const usernameRules = [
  v => !!v || '아이디를 입력해주세요',
  v => (v && v.length >= 3) || '아이디는 3자 이상이어야 합니다',
  v => (v && v.length <= 20) || '아이디는 20자 이하여야 합니다',
  v => /^[a-zA-Z0-9]+$/.test(v) || '아이디는 영문자와 숫자만 사용가능합니다'
]

const nameRules = [
  v => !!v || '이름을 입력해주세요',
  v => (v && v.length >= 2) || '이름은 2자 이상이어야 합니다',
  v => (v && v.length <= 10) || '이름은 10자 이하여야 합니다'
]

// empCode 밸리데이션 규칙 추가
const empCodeRules = [
  v => !!v || '사원번호를 입력해주세요',
  v => /^EMP-\d{2}$/.test(v) || '사원번호는 EMP-00 형식이어야 합니다 (예: EMP-88)',
]

const passwordRules = [
  v => !!v || '비밀번호를 입력해주세요',
  v => (v && v.length >= 4) || '비밀번호는 4자 이상이어야 합니다',
  v => (v && v.length <= 20) || '비밀번호는 20자 이하여야 합니다'
]

const confirmPasswordRules = [
  v => !!v || '비밀번호 확인을 입력해주세요',
  v => v === registerForm.password || '비밀번호가 일치하지 않습니다'
]

// Spring Boot 백엔드 API 기본 URL
const API_BASE_URL = 'http://localhost:8282'

// 스낵바 표시 함수
const showMessage = (message, color = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// 회원가입 처리
const handleRegister = async () => {
  // 에러 메시지 초기화
  Object.keys(registerError).forEach(key => {
    registerError[key] = ''
  })

  // 폼 유효성 검사
  if (!registerFormRef.value) return
  const { valid } = await registerFormRef.value.validate()
  if (!valid) return

  isRegisterLoading.value = true

  try {
    // Spring Boot 백엔드 API 호출
    const response = await fetch(`${API_BASE_URL}/hr/affair/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: registerForm.username,
        name: registerForm.name,
        empCode: registerForm.empCode,  // empCode 추가
        passWord: registerForm.password
      })
    })

    if (response.ok) {
      const data = await response.json()
      showMessage('회원가입이 완료되었습니다. 로그인해주세요.', 'success')
      
      // 폼 초기화 및 로그인 화면으로 이동
      Object.keys(registerForm).forEach(key => {
        registerForm[key] = ''
      })
      goToLogin()
      
    } else if (response.status === 409) {
      // 중복 처리 (아이디 또는 사원번호 중복)
      const errorData = await response.json()
      if (errorData.field === 'userName') {
        registerError.username = '이미 사용중인 아이디입니다'
        showMessage('이미 사용중인 아이디입니다.', 'error')
      } else if (errorData.field === 'empCode') {
        registerError.empCode = '이미 사용중인 사원번호입니다'
        showMessage('이미 사용중인 사원번호입니다.', 'error')
      } else {
        showMessage('이미 사용중인 정보입니다.', 'error')
      }
    } else {
      // 기타 에러
      const errorData = await response.json()
      showMessage(errorData.message || '회원가입 중 오류가 발생했습니다.', 'error')
    }
  } catch (error) {
    console.error('Register error:', error)
    showMessage('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error')
  } finally {
    isRegisterLoading.value = false
  }
}


// 로그인 처리 (백엔드 연동)
const handleLogin = async () => {
  loginError.value = false
  isLoading.value = true
  
  try {
    // Spring Boot 백엔드 API 호출
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: loginForm.username,
        passWord: loginForm.password
      })
    })
            
    if (response.ok) {
      const data = await response.json()
             
      console.log('data:', data)
             
      currentUser.value = {
        name: data.name,
        id: data.username
      }
      isLoggedIn.value = true
             
      userStore.currentUser = {
       name: data.name,
       id: data.username
      }
      
      console.log(userStore)

      // 로그인 응답에서 바로 empCode 설정 (axios 호출 제거)
      userStore.empCode = data.empCode
      userStore.inOutSide = data.inOutSide
      // 로그인 응답에서 i , o 
      console.log('inOutSide:', userStore.inOutSide)
      console.log('empCode:', userStore.empCode)
      // 로그인 상태 유지 옵션
      if (loginForm.rememberMe) {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
        localStorage.setItem('userPermission', data.inOutSide)
      }
             
      showMessage(`${data.name}님 환영합니다!`, 'success')
           
      console.log('loginUser:',JSON.stringify(currentUser.value.name))
      console.log('현재 로그인한 사용자 이름:', currentUser.value.name)
      console.log('inOutSide:', userStore.inOutSide)
        
    } else {
      loginError.value = true
      showMessage('아이디 또는 비밀번호를 확인해주세요.', 'error')
    }
    
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = true
    showMessage('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error')
  } finally {
    isLoading.value = false
  }
}
    
    
  
 

// 로그아웃 처리
const handleLogout = () => {
  isLoggedIn.value = false
  currentUser.value = { name: '', id: '' }
  currentView.value = 'login'
  loginForm.username = ''
  loginForm.password = ''
  loginForm.rememberMe = false
  
  // 로컬스토리지 정리
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('currentUser')
  
  showMessage('로그아웃되었습니다.', 'info')
}

// 페이지 로드 시 로그인 상태 확인
onMounted(() => {
  const savedLoginState = localStorage.getItem('isLoggedIn')
  const savedUser = localStorage.getItem('currentUser')
  
  if (savedLoginState === 'true' && savedUser) {
    isLoggedIn.value = true
    currentUser.value.name = JSON.parse(savedUser)
  }
 // attendance.value = await fetchAttendanceData()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
  color: white;
  font-weight: 300;
  font-size: 3rem;
}

.text-medium-emphasis {
  color: rgba(255, 255, 255, 0.7);
}

.text-medium-emphasis a {
  color: rgba(255, 255, 255, 0.9);
}

.text-medium-emphasis a:hover {
  color: white;
}
</style>